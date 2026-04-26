"""
Partner rank calculation utilities.

Rank thresholds are based on % of total possible points earned:
  earned_points = (completed_shorts × 1000) + (completed_masterclasses × 4000)
  max_points    = (total_shorts × 1000) + (total_masterclasses × 4000)
  rank_pct      = earned / max × 100  (0 if max == 0)

Ranks (Öneri E):
  👤 Üye       0  – 9.99%
  ⭐ Temsilci  10 – 24.99%
  💼 Danışman  25 – 49.99%
  💎 Elit      50 – 74.99%
  🔥 Efsane    75 – 89.99%
  💠 Diamond   90 – 100%
"""
from __future__ import annotations
from enum import Enum


POINTS_PER_SHORT: int = 1_000
POINTS_PER_MASTERCLASS: int = 4_000


class PartnerRank(str, Enum):
    UYE = "UYE"
    TEMSILCI = "TEMSILCI"
    DANISHMAN = "DANISHMAN"
    ELIT = "ELIT"
    EFSANE = "EFSANE"
    DIAMOND = "DIAMOND"


RANK_META: dict[PartnerRank, dict] = {
    PartnerRank.UYE: {
        "label": "Üye",
        "emoji": "👤",
        "color": "gray",
        "min_pct": 0,
    },
    PartnerRank.TEMSILCI: {
        "label": "Temsilci",
        "emoji": "⭐",
        "color": "blue",
        "min_pct": 10,
    },
    PartnerRank.DANISHMAN: {
        "label": "Danışman",
        "emoji": "💼",
        "color": "purple",
        "min_pct": 25,
    },
    PartnerRank.ELIT: {
        "label": "Elit",
        "emoji": "💎",
        "color": "cyan",
        "min_pct": 50,
    },
    PartnerRank.EFSANE: {
        "label": "Efsane",
        "emoji": "🔥",
        "color": "orange",
        "min_pct": 75,
    },
    PartnerRank.DIAMOND: {
        "label": "Diamond",
        "emoji": "💠",
        "color": "teal",
        "min_pct": 90,
    },
}


def compute_rank(percentage: float) -> PartnerRank:
    """Return the PartnerRank that corresponds to the given percentage."""
    if percentage >= 90:
        return PartnerRank.DIAMOND
    if percentage >= 75:
        return PartnerRank.EFSANE
    if percentage >= 50:
        return PartnerRank.ELIT
    if percentage >= 25:
        return PartnerRank.DANISHMAN
    if percentage >= 10:
        return PartnerRank.TEMSILCI
    return PartnerRank.UYE


def rank_response(rank: PartnerRank, earned: int, maximum: int, pct: float) -> dict:
    meta = RANK_META[rank]
    return {
        "rank": rank.value,
        "rank_label": meta["label"],
        "rank_emoji": meta["emoji"],
        "rank_color": meta["color"],
        "earned_points": earned,
        "max_points": maximum,
        "rank_percentage": pct,
    }
