import { json } from '@sveltejs/kit';
import mysqlx from '@mysql/xdevapi';
import dotenv from 'dotenv';
dotenv.config(); // loads from .env automatically

const DB_NAME = 'osrs_market';

export async function GET({ url }) {
	const sort = url.searchParams.get('sort') ?? 'profit';
	const direction = url.searchParams.get('direction') === 'asc' ? 'ASC' : 'DESC';
	const members = url.searchParams.get('members') === 'true';

	// Allow this field
	const allowedFields = ['buy_price', 'sell_price', 'profit', 'profitability', 'last_update'];
	const safeSort = allowedFields.includes(sort) ? sort : 'profit';

	const session = await mysqlx.getSession({
		host: process.env.MYSQL_HOST,
		port: parseInt(process.env.MYSQL_PORT || '33060'),
		user: process.env.MYSQL_USERNAME ? process.env.MYSQL_USERNAME : "",
		password: process.env.MYSQL_PASSWORD,
	});

	const db = session.getSchema('osrs_market');

	// Base SQL
	let sql = `
		SELECT * FROM osrs_market.item_summary_view
		WHERE 1 = 1
	`;

	const membersParam = url.searchParams.get('members');
	if (membersParam === 'f2p') {
	sql += ` AND members = FALSE`;
	} else if (membersParam === 'members') {
	sql += ` AND members = TRUE`;
	}

	// Handle sorting (profitability needs to be calculated)
	sql += ` ORDER BY `;

	
	if (safeSort === 'profitability') {
		sql += `(profit * IFNULL(ge_limit, 1)) ${direction}`;
	} else {
		sql += `${safeSort} ${direction}`;
	}

	const result = await session.sql(sql).execute();
	const rows = result.fetchAll();
	const items = rows.map(row => ({
		item_ID: row[0],
		item_name: row[1],
		icon: row[2],
		examine: row[3],
		members: row[4],
		item_value: row[5],
		lowalch: row[6],
		highalch: row[7],
		ge_limit: row[8],
		buy_price: row[9],
		sell_price: row[10],
		profit: row[11],
		last_updated: row[12],
		stddev_buy: row[13],
		stddev_sell: row[14],
		sources: row[15] ?? null
	  }));

	await session.close();
	  
	return json(items);
}

