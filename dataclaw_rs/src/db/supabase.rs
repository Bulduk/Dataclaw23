use sqlx::{postgres::PgPoolOptions, Pool, Postgres};
use std::env;

pub async fn init_pool() -> Pool<Postgres> {
    let db_url = env::var("DATABASE_URL").expect("DATABASE_URL must be set in .env");
    
    tracing::info!("Connecting to Supabase (PostgreSQL)...");
    PgPoolOptions::new()
        .max_connections(10)
        .connect(&db_url)
        .await
        .expect("Failed to connect to Supabase DB")
}
