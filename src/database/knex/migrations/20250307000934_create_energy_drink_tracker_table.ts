import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('energy_drink_tracker', (table) => {
    table.increments('id').primary();
    table.date('date').notNullable();
    table.boolean('drank').notNullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('energy_drink_tracker');
}

