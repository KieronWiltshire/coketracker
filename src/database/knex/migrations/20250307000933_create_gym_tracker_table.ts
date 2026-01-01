import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('gym_tracker', (table) => {
    table.increments('id').primary();
    table.date('date').notNullable();
    table.boolean('went').notNullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('gym_tracker');
}

