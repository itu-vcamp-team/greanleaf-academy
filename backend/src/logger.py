import logging
import sys
from config import get_settings

settings = get_settings()


def setup_logging():
    log_level = logging.DEBUG if settings.APP_ENV == "development" else logging.INFO

    logging.basicConfig(
        level=log_level,
        format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
        handlers=[logging.StreamHandler(sys.stdout)],
    )


logger = logging.getLogger("greenleaf")
