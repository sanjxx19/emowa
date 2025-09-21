import pymysql
import sys
import time
from app.config import settings
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def create_database():
    """Standalone database creation utility"""
    max_retries = 30
    retry_delay = 2

    logger.info(f"Creating database '{settings.DB_NAME}' on {settings.DB_HOST}:{settings.DB_PORT}")

    for attempt in range(max_retries):
        try:
            connection = pymysql.connect(
                host=settings.DB_HOST,
                port=settings.DB_PORT,
                user='root',
                password=settings.DB_PASSWORD,
                charset='utf8mb4'
            )

            with connection.cursor() as cursor:
                # Create database
                cursor.execute(f"CREATE DATABASE IF NOT EXISTS `{settings.DB_NAME}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci")
                logger.info(f"Database '{settings.DB_NAME}' created")

                # Create user if different from root
                if settings.DB_USER != 'root':
                    cursor.execute(f"CREATE USER IF NOT EXISTS '{settings.DB_USER}'@'%' IDENTIFIED BY '{settings.DB_PASSWORD}'")
                    cursor.execute(f"GRANT ALL PRIVILEGES ON `{settings.DB_NAME}`.* TO '{settings.DB_USER}'@'%'")
                    cursor.execute("FLUSH PRIVILEGES")
                    logger.info(f"User '{settings.DB_USER}' created and granted privileges")

            connection.commit()
            connection.close()

            logger.info("Database setup completed successfully!")
            return True

        except Exception as e:
            logger.warning(f"Attempt {attempt + 1}/{max_retries} failed: {e}")
            if attempt < max_retries - 1:
                logger.info(f"Retrying in {retry_delay} seconds...")
                time.sleep(retry_delay)
            else:
                logger.error(f"Failed to create database after {max_retries} attempts")
                return False

    return False

if __name__ == "__main__":
    success = create_database()
    sys.exit(0 if success else 1)
