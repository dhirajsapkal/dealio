"""
Comprehensive Guitar Database
Contains major guitar brands and their popular models with pricing information.
"""

GUITAR_DATABASE = {
    # MAJOR ELECTRIC GUITAR BRANDS
    "Fender": {
        "type": "Electric/Acoustic",
        "electric": {
            "Stratocaster": {"msrp": 799, "category": "Electric", "tier": "Standard"},
            "Telecaster": {"msrp": 799, "category": "Electric", "tier": "Standard"}, 
            "Jazzmaster": {"msrp": 999, "category": "Electric", "tier": "Standard"},
            "Jaguar": {"msrp": 999, "category": "Electric", "tier": "Standard"},
            "Mustang": {"msrp": 599, "category": "Electric", "tier": "Entry"},
            "Duo-Sonic": {"msrp": 449, "category": "Electric", "tier": "Entry"},
            "Player Stratocaster": {"msrp": 849, "category": "Electric", "tier": "Standard"},
            "Player Telecaster": {"msrp": 849, "category": "Electric", "tier": "Standard"},
            "American Professional II Stratocaster": {"msrp": 1749, "category": "Electric", "tier": "Professional"},
            "American Professional II Telecaster": {"msrp": 1749, "category": "Electric", "tier": "Professional"},
            "American Ultra Stratocaster": {"msrp": 2199, "category": "Electric", "tier": "Professional"},
            "American Ultra Telecaster": {"msrp": 2199, "category": "Electric", "tier": "Professional"},
        },
        "acoustic": {
            "CD-60S": {"msrp": 199, "category": "Acoustic", "tier": "Entry"},
            "CD-140SCE": {"msrp": 399, "category": "Acoustic", "tier": "Standard"},
            "PM-1 Standard Dreadnought": {"msrp": 699, "category": "Acoustic", "tier": "Standard"},
            "Newporter Player": {"msrp": 299, "category": "Acoustic", "tier": "Entry"},
        }
    },

    "Gibson": {
        "type": "Electric/Acoustic",
        "electric": {
            "Les Paul Standard": {"msrp": 2899, "category": "Electric", "tier": "Professional"},
            "Les Paul Studio": {"msrp": 1599, "category": "Electric", "tier": "Standard"},
            "Les Paul Tribute": {"msrp": 1199, "category": "Electric", "tier": "Standard"},
            "SG Standard": {"msrp": 1899, "category": "Electric", "tier": "Standard"},
            "SG Special": {"msrp": 1099, "category": "Electric", "tier": "Standard"},
            "ES-335": {"msrp": 3199, "category": "Electric", "tier": "Professional"},
            "ES-339": {"msrp": 2699, "category": "Electric", "tier": "Professional"},
            "Flying V": {"msrp": 1899, "category": "Electric", "tier": "Standard"},
            "Explorer": {"msrp": 1899, "category": "Electric", "tier": "Standard"},
            "Firebird": {"msrp": 2199, "category": "Electric", "tier": "Professional"},
        },
        "acoustic": {
            "J-45": {"msrp": 2799, "category": "Acoustic", "tier": "Professional"},
            "J-200": {"msrp": 4699, "category": "Acoustic", "tier": "Premium"},
            "Hummingbird": {"msrp": 3999, "category": "Acoustic", "tier": "Premium"},
            "Dove": {"msrp": 3999, "category": "Acoustic", "tier": "Premium"},
            "G-45": {"msrp": 1399, "category": "Acoustic", "tier": "Standard"},
        }
    },

    "Epiphone": {
        "type": "Electric/Acoustic",
        "electric": {
            "Les Paul Standard": {"msrp": 699, "category": "Electric", "tier": "Standard"},
            "Les Paul Studio": {"msrp": 399, "category": "Electric", "tier": "Entry"},
            "SG Standard": {"msrp": 499, "category": "Electric", "tier": "Entry"},
            "Casino": {"msrp": 699, "category": "Electric", "tier": "Standard"},
            "Dot": {"msrp": 549, "category": "Electric", "tier": "Standard"},
            "Sheraton": {"msrp": 899, "category": "Electric", "tier": "Standard"},
            "Flying V": {"msrp": 499, "category": "Electric", "tier": "Entry"},
            "Explorer": {"msrp": 499, "category": "Electric", "tier": "Entry"},
        },
        "acoustic": {
            "DR-100": {"msrp": 149, "category": "Acoustic", "tier": "Entry"},
            "AJ-220S": {"msrp": 249, "category": "Acoustic", "tier": "Entry"},
            "Hummingbird PRO": {"msrp": 449, "category": "Acoustic", "tier": "Standard"},
            "J-200": {"msrp": 649, "category": "Acoustic", "tier": "Standard"},
        }
    },

    "Ibanez": {
        "type": "Electric/Acoustic/Bass",
        "electric": {
            "RG": {"msrp": 499, "category": "Electric", "tier": "Standard"},
            "RG550": {"msrp": 799, "category": "Electric", "tier": "Standard"},
            "RG652AHM": {"msrp": 899, "category": "Electric", "tier": "Standard"},
            "S": {"msrp": 699, "category": "Electric", "tier": "Standard"},
            "JEM": {"msrp": 2299, "category": "Electric", "tier": "Professional"},
            "JS": {"msrp": 1999, "category": "Electric", "tier": "Professional"},
            "AZ": {"msrp": 1299, "category": "Electric", "tier": "Standard"},
            "Artcore": {"msrp": 499, "category": "Electric", "tier": "Standard"},
            "Iceman": {"msrp": 899, "category": "Electric", "tier": "Standard"},
            "RG7": {"msrp": 649, "category": "Electric", "tier": "Standard"},
            "RG8": {"msrp": 749, "category": "Electric", "tier": "Standard"},
        },
        "acoustic": {
            "AW54CE": {"msrp": 359, "category": "Acoustic", "tier": "Entry"},
            "PC12MH": {"msrp": 199, "category": "Acoustic", "tier": "Entry"},
            "GA35TCE": {"msrp": 449, "category": "Acoustic", "tier": "Standard"},
        },
        "bass": {
            "SR": {"msrp": 599, "category": "Bass", "tier": "Standard"},
            "GSR": {"msrp": 299, "category": "Bass", "tier": "Entry"},
            "SRMS": {"msrp": 799, "category": "Bass", "tier": "Standard"},
        }
    },

    "Yamaha": {
        "type": "Electric/Acoustic/Classical",
        "electric": {
            "Pacifica": {"msrp": 399, "category": "Electric", "tier": "Entry"},
            "Pacifica 612": {"msrp": 699, "category": "Electric", "tier": "Standard"},
            "Revstar": {"msrp": 799, "category": "Electric", "tier": "Standard"},
            "RGX": {"msrp": 349, "category": "Electric", "tier": "Entry"},
        },
        "acoustic": {
            "FG830": {"msrp": 299, "category": "Acoustic", "tier": "Entry"},
            "FG840": {"msrp": 399, "category": "Acoustic", "tier": "Standard"},
            "FS830": {"msrp": 319, "category": "Acoustic", "tier": "Entry"},
            "APX600": {"msrp": 449, "category": "Acoustic", "tier": "Standard"},
            "A3R": {"msrp": 699, "category": "Acoustic", "tier": "Standard"},
            "L-Series": {"msrp": 1299, "category": "Acoustic", "tier": "Professional"},
        },
        "classical": {
            "C40": {"msrp": 149, "category": "Classical", "tier": "Entry"},
            "C70": {"msrp": 199, "category": "Classical", "tier": "Entry"},
            "CG122MC": {"msrp": 249, "category": "Classical", "tier": "Entry"},
            "CG142C": {"msrp": 349, "category": "Classical", "tier": "Standard"},
        }
    },

    "PRS": {
        "type": "Electric/Acoustic",
        "electric": {
            "SE Custom 24": {"msrp": 899, "category": "Electric", "tier": "Standard"},
            "SE Standard 24": {"msrp": 699, "category": "Electric", "tier": "Standard"},
            "S2 Custom 24": {"msrp": 1599, "category": "Electric", "tier": "Professional"},
            "Core Custom 24": {"msrp": 4200, "category": "Electric", "tier": "Premium"},
            "Silver Sky": {"msrp": 2699, "category": "Electric", "tier": "Professional"},
            "SE Silver Sky": {"msrp": 899, "category": "Electric", "tier": "Standard"},
            "McCarty": {"msrp": 4700, "category": "Electric", "tier": "Premium"},
            "DGT": {"msrp": 4900, "category": "Electric", "tier": "Premium"},
        },
        "acoustic": {
            "SE A40E": {"msrp": 899, "category": "Acoustic", "tier": "Standard"},
            "SE A50E": {"msrp": 1199, "category": "Acoustic", "tier": "Standard"},
            "Angelus": {"msrp": 3999, "category": "Acoustic", "tier": "Premium"},
        }
    },

    "Schecter": {
        "type": "Electric/Acoustic/Bass",
        "electric": {
            "Omen 6": {"msrp": 399, "category": "Electric", "tier": "Entry"},
            "Damien": {"msrp": 449, "category": "Electric", "tier": "Entry"},
            "C-1": {"msrp": 699, "category": "Electric", "tier": "Standard"},
            "Hellraiser": {"msrp": 1199, "category": "Electric", "tier": "Standard"},
            "Solo 2 Custom": {"msrp": 1199, "category": "Electric", "tier": "Standard"},
            "Solo 6": {"msrp": 899, "category": "Electric", "tier": "Standard"},
            "Banshee": {"msrp": 899, "category": "Electric", "tier": "Standard"},
            "Reaper": {"msrp": 1099, "category": "Electric", "tier": "Standard"},
            "Nick Johnston": {"msrp": 1399, "category": "Electric", "tier": "Professional"},
            "Sun Valley": {"msrp": 799, "category": "Electric", "tier": "Standard"},
            "PT": {"msrp": 649, "category": "Electric", "tier": "Standard"},
            "Traditional": {"msrp": 1599, "category": "Electric", "tier": "Professional"},
        },
        "acoustic": {
            "Orleans Studio": {"msrp": 499, "category": "Acoustic", "tier": "Standard"},
            "Deluxe": {"msrp": 699, "category": "Acoustic", "tier": "Standard"},
        },
        "bass": {
            "Stiletto": {"msrp": 899, "category": "Bass", "tier": "Standard"},
            "Riot": {"msrp": 699, "category": "Bass", "tier": "Standard"},
        }
    },

    "ESP": {
        "type": "Electric/Bass",
        "electric": {
            "LTD EC-256": {"msrp": 429, "category": "Electric", "tier": "Entry"},
            "LTD EC-1000": {"msrp": 999, "category": "Electric", "tier": "Standard"},
            "LTD MH-1000": {"msrp": 1099, "category": "Electric", "tier": "Standard"},
            "E-II Eclipse": {"msrp": 2499, "category": "Electric", "tier": "Professional"},
            "E-II Horizon": {"msrp": 2699, "category": "Electric", "tier": "Professional"},
            "Original Eclipse": {"msrp": 4999, "category": "Electric", "tier": "Premium"},
            "Viper": {"msrp": 799, "category": "Electric", "tier": "Standard"},
            "Arrow": {"msrp": 899, "category": "Electric", "tier": "Standard"},
        },
        "bass": {
            "LTD B-204SM": {"msrp": 649, "category": "Bass", "tier": "Standard"},
            "LTD D-4": {"msrp": 499, "category": "Bass", "tier": "Entry"},
        }
    },

    "Jackson": {
        "type": "Electric",
        "electric": {
            "JS Series": {"msrp": 349, "category": "Electric", "tier": "Entry"},
            "X Series": {"msrp": 649, "category": "Electric", "tier": "Standard"},
            "Pro Series": {"msrp": 999, "category": "Electric", "tier": "Standard"},
            "Dinky": {"msrp": 499, "category": "Electric", "tier": "Entry"},
            "Rhoads": {"msrp": 799, "category": "Electric", "tier": "Standard"},
            "King V": {"msrp": 799, "category": "Electric", "tier": "Standard"},
            "Warrior": {"msrp": 899, "category": "Electric", "tier": "Standard"},
            "Soloist": {"msrp": 2599, "category": "Electric", "tier": "Professional"},
            "Kelly": {"msrp": 699, "category": "Electric", "tier": "Standard"},
        }
    },

    "Gretsch": {
        "type": "Electric/Acoustic",
        "electric": {
            "G5220": {"msrp": 549, "category": "Electric", "tier": "Standard"},
            "G6120": {"msrp": 2999, "category": "Electric", "tier": "Professional"},
            "White Falcon": {"msrp": 4599, "category": "Electric", "tier": "Premium"},
            "Duo Jet": {"msrp": 2299, "category": "Electric", "tier": "Professional"},
            "Penguin": {"msrp": 2699, "category": "Electric", "tier": "Professional"},
            "Country Gentleman": {"msrp": 2999, "category": "Electric", "tier": "Professional"},
        },
        "acoustic": {
            "G5024E": {"msrp": 899, "category": "Acoustic", "tier": "Standard"},
            "G5022C": {"msrp": 649, "category": "Acoustic", "tier": "Standard"},
        }
    },

    "Martin": {
        "type": "Acoustic/Classical",
        "acoustic": {
            "D-28": {"msrp": 3499, "category": "Acoustic", "tier": "Premium"},
            "D-18": {"msrp": 2699, "category": "Acoustic", "tier": "Professional"},
            "000-28": {"msrp": 3299, "category": "Acoustic", "tier": "Premium"},
            "HD-28": {"msrp": 3699, "category": "Acoustic", "tier": "Premium"},
            "OM-28": {"msrp": 3299, "category": "Acoustic", "tier": "Premium"},
            "X Series": {"msrp": 699, "category": "Acoustic", "tier": "Standard"},
            "Road Series": {"msrp": 499, "category": "Acoustic", "tier": "Entry"},
            "15 Series": {"msrp": 1199, "category": "Acoustic", "tier": "Standard"},
            "16 Series": {"msrp": 1699, "category": "Acoustic", "tier": "Professional"},
        }
    },

    "Taylor": {
        "type": "Acoustic/Classical",
        "acoustic": {
            "214ce": {"msrp": 1199, "category": "Acoustic", "tier": "Standard"},
            "314ce": {"msrp": 1999, "category": "Acoustic", "tier": "Professional"},
            "414ce": {"msrp": 2699, "category": "Acoustic", "tier": "Professional"},
            "814ce": {"msrp": 4199, "category": "Acoustic", "tier": "Premium"},
            "914ce": {"msrp": 5199, "category": "Acoustic", "tier": "Premium"},
            "Academy 10": {"msrp": 649, "category": "Acoustic", "tier": "Standard"},
            "Big Baby": {"msrp": 799, "category": "Acoustic", "tier": "Standard"},
            "GS Mini": {"msrp": 599, "category": "Acoustic", "tier": "Standard"},
            "Grand Auditorium": {"msrp": 1499, "category": "Acoustic", "tier": "Standard"},
            "Grand Concert": {"msrp": 1399, "category": "Acoustic", "tier": "Standard"},
        }
    },

    "Guild": {
        "type": "Electric/Acoustic",
        "electric": {
            "Starfire": {"msrp": 1499, "category": "Electric", "tier": "Professional"},
            "Surfliner": {"msrp": 999, "category": "Electric", "tier": "Standard"},
            "T-Bird": {"msrp": 899, "category": "Electric", "tier": "Standard"},
        },
        "acoustic": {
            "D-40": {"msrp": 1799, "category": "Acoustic", "tier": "Professional"},
            "OM-240": {"msrp": 1399, "category": "Acoustic", "tier": "Standard"},
            "F-250": {"msrp": 999, "category": "Acoustic", "tier": "Standard"},
            "Westerly": {"msrp": 1699, "category": "Acoustic", "tier": "Professional"},
        }
    },

    "Rickenbacker": {
        "type": "Electric/Bass",
        "electric": {
            "330": {"msrp": 2499, "category": "Electric", "tier": "Professional"},
            "360": {"msrp": 2899, "category": "Electric", "tier": "Professional"},
            "370": {"msrp": 3199, "category": "Electric", "tier": "Professional"},
            "620": {"msrp": 2799, "category": "Electric", "tier": "Professional"},
        },
        "bass": {
            "4003": {"msrp": 2199, "category": "Bass", "tier": "Professional"},
            "4001": {"msrp": 2499, "category": "Bass", "tier": "Professional"},
        }
    },

    "Washburn": {
        "type": "Electric/Acoustic",
        "electric": {
            "WI-14": {"msrp": 399, "category": "Electric", "tier": "Entry"},
            "Parallaxe": {"msrp": 799, "category": "Electric", "tier": "Standard"},
            "Idol": {"msrp": 699, "category": "Electric", "tier": "Standard"},
        },
        "acoustic": {
            "Heritage Series": {"msrp": 899, "category": "Acoustic", "tier": "Standard"},
            "Comfort Series": {"msrp": 449, "category": "Acoustic", "tier": "Entry"},
        }
    },

    "Dean": {
        "type": "Electric/Acoustic",
        "electric": {
            "ML": {"msrp": 499, "category": "Electric", "tier": "Entry"},
            "V": {"msrp": 549, "category": "Electric", "tier": "Entry"},
            "Z": {"msrp": 599, "category": "Electric", "tier": "Standard"},
            "Razorback": {"msrp": 899, "category": "Electric", "tier": "Standard"},
            "Cadillac": {"msrp": 799, "category": "Electric", "tier": "Standard"},
        },
        "acoustic": {
            "Tradition": {"msrp": 299, "category": "Acoustic", "tier": "Entry"},
            "Exhibition": {"msrp": 499, "category": "Acoustic", "tier": "Standard"},
        }
    },

    "BC Rich": {
        "type": "Electric",
        "electric": {
            "Warlock": {"msrp": 449, "category": "Electric", "tier": "Entry"},
            "Mockingbird": {"msrp": 599, "category": "Electric", "tier": "Standard"},
            "Beast": {"msrp": 699, "category": "Electric", "tier": "Standard"},
            "Bich": {"msrp": 799, "category": "Electric", "tier": "Standard"},
        }
    },

    # Additional Popular Brands
    "Music Man": {
        "type": "Electric/Bass",
        "electric": {
            "StingRay": {"msrp": 2199, "category": "Electric", "tier": "Professional"},
            "Silhouette": {"msrp": 2399, "category": "Electric", "tier": "Professional"},
            "Axis": {"msrp": 2499, "category": "Electric", "tier": "Professional"},
            "Majesty": {"msrp": 3999, "category": "Electric", "tier": "Premium"},
        },
        "bass": {
            "StingRay": {"msrp": 2199, "category": "Bass", "tier": "Professional"},
            "Bongo": {"msrp": 2399, "category": "Bass", "tier": "Professional"},
        }
    },

    "Charvel": {
        "type": "Electric",
        "electric": {
            "DK24": {"msrp": 899, "category": "Electric", "tier": "Standard"},
            "Pro-Mod": {"msrp": 1199, "category": "Electric", "tier": "Standard"},
            "San Dimas": {"msrp": 2499, "category": "Electric", "tier": "Professional"},
            "So-Cal": {"msrp": 1799, "category": "Electric", "tier": "Professional"},
        }
    },

    "Godin": {
        "type": "Electric/Acoustic",
        "electric": {
            "Session": {"msrp": 899, "category": "Electric", "tier": "Standard"},
            "Stadium": {"msrp": 1199, "category": "Electric", "tier": "Standard"},
            "Freeway": {"msrp": 799, "category": "Electric", "tier": "Standard"},
        },
        "acoustic": {
            "A6 Ultra": {"msrp": 1299, "category": "Acoustic", "tier": "Standard"},
            "Metropolis": {"msrp": 999, "category": "Acoustic", "tier": "Standard"},
        }
    },

    "Seagull": {
        "type": "Acoustic",
        "acoustic": {
            "S6 Original": {"msrp": 699, "category": "Acoustic", "tier": "Standard"},
            "Artist Mosaic": {"msrp": 899, "category": "Acoustic", "tier": "Standard"},
            "Coastline": {"msrp": 549, "category": "Acoustic", "tier": "Standard"},
            "Maritime SWS": {"msrp": 999, "category": "Acoustic", "tier": "Standard"},
        }
    },

    "Takamine": {
        "type": "Acoustic/Classical",
        "acoustic": {
            "GD20": {"msrp": 299, "category": "Acoustic", "tier": "Entry"},
            "GD30": {"msrp": 399, "category": "Acoustic", "tier": "Entry"},
            "P3NY": {"msrp": 899, "category": "Acoustic", "tier": "Standard"},
            "Pro Series": {"msrp": 1499, "category": "Acoustic", "tier": "Professional"},
        }
    },

    "Ovation": {
        "type": "Acoustic",
        "acoustic": {
            "Celebrity": {"msrp": 499, "category": "Acoustic", "tier": "Standard"},
            "Elite": {"msrp": 999, "category": "Acoustic", "tier": "Standard"},
            "Adamas": {"msrp": 2999, "category": "Acoustic", "tier": "Premium"},
        }
    },

    "Breedlove": {
        "type": "Acoustic",
        "acoustic": {
            "Discovery": {"msrp": 699, "category": "Acoustic", "tier": "Standard"},
            "Oregon": {"msrp": 1299, "category": "Acoustic", "tier": "Standard"},
            "Premier": {"msrp": 1899, "category": "Acoustic", "tier": "Professional"},
            "Masterclass": {"msrp": 3999, "category": "Acoustic", "tier": "Premium"},
        }
    },

    "Squier": {
        "type": "Electric",
        "electric": {
            "Bullet Stratocaster": {"msrp": 199, "category": "Electric", "tier": "Entry"},
            "Affinity Stratocaster": {"msrp": 249, "category": "Electric", "tier": "Entry"},
            "Classic Vibe": {"msrp": 449, "category": "Electric", "tier": "Standard"},
            "Contemporary": {"msrp": 399, "category": "Electric", "tier": "Entry"},
            "Paranormal": {"msrp": 499, "category": "Electric", "tier": "Standard"},
        }
    },

    "Cort": {
        "type": "Electric/Acoustic/Bass",
        "electric": {
            "G Series": {"msrp": 399, "category": "Electric", "tier": "Entry"},
            "X Series": {"msrp": 549, "category": "Electric", "tier": "Standard"},
            "KX Series": {"msrp": 699, "category": "Electric", "tier": "Standard"},
        },
        "acoustic": {
            "AD810": {"msrp": 199, "category": "Acoustic", "tier": "Entry"},
            "Earth Series": {"msrp": 399, "category": "Acoustic", "tier": "Entry"},
            "Gold Series": {"msrp": 699, "category": "Acoustic", "tier": "Standard"},
        }
    },

    "Eastman": {
        "type": "Electric/Acoustic",
        "electric": {
            "SB59": {"msrp": 1299, "category": "Electric", "tier": "Standard"},
            "T486": {"msrp": 1099, "category": "Electric", "tier": "Standard"},
        },
        "acoustic": {
            "E1D": {"msrp": 599, "category": "Acoustic", "tier": "Standard"},
            "AC222": {"msrp": 899, "category": "Acoustic", "tier": "Standard"},
            "Traditional Series": {"msrp": 1499, "category": "Acoustic", "tier": "Professional"},
        }
    },

    "Alvarez": {
        "type": "Acoustic",
        "acoustic": {
            "AD60": {"msrp": 349, "category": "Acoustic", "tier": "Entry"},
            "Artist Series": {"msrp": 599, "category": "Acoustic", "tier": "Standard"},
            "Masterworks": {"msrp": 999, "category": "Acoustic", "tier": "Standard"},
            "Yairi": {"msrp": 1999, "category": "Acoustic", "tier": "Professional"},
        }
    },

    "D'Angelico": {
        "type": "Electric/Acoustic",
        "electric": {
            "Premier DC": {"msrp": 899, "category": "Electric", "tier": "Standard"},
            "Deluxe Series": {"msrp": 1299, "category": "Electric", "tier": "Standard"},
            "Excel Series": {"msrp": 2499, "category": "Electric", "tier": "Professional"},
        },
        "acoustic": {
            "Premier Bowery": {"msrp": 649, "category": "Acoustic", "tier": "Standard"},
            "Premier Gramercy": {"msrp": 799, "category": "Acoustic", "tier": "Standard"},
        }
    },

    "Lag": {
        "type": "Electric/Acoustic",
        "electric": {
            "Arkane": {"msrp": 699, "category": "Electric", "tier": "Standard"},
            "Imperator": {"msrp": 899, "category": "Electric", "tier": "Standard"},
        },
        "acoustic": {
            "Tramontane": {"msrp": 399, "category": "Acoustic", "tier": "Entry"},
            "Occitania": {"msrp": 699, "category": "Acoustic", "tier": "Standard"},
        }
    },

    "Solar": {
        "type": "Electric",
        "electric": {
            "A1.6": {"msrp": 599, "category": "Electric", "tier": "Standard"},
            "A2.6": {"msrp": 799, "category": "Electric", "tier": "Standard"},
            "V1.6": {"msrp": 649, "category": "Electric", "tier": "Standard"},
            "S1.6": {"msrp": 749, "category": "Electric", "tier": "Standard"},
        }
    },

    "Strandberg": {
        "type": "Electric",
        "electric": {
            "Boden": {"msrp": 1999, "category": "Electric", "tier": "Professional"},
            "Boden Metal": {"msrp": 2199, "category": "Electric", "tier": "Professional"},
            "Sälen": {"msrp": 999, "category": "Electric", "tier": "Standard"},
        }
    }
}


def get_all_brands():
    """Get all guitar brands from the database."""
    return list(GUITAR_DATABASE.keys())


def get_models_for_brand(brand, guitar_type=None):
    """Get all models for a specific brand, optionally filtered by type."""
    if brand not in GUITAR_DATABASE:
        return []
    
    brand_data = GUITAR_DATABASE[brand]
    models = []
    
    for category in ['electric', 'acoustic', 'classical', 'bass']:
        if category in brand_data:
            category_models = brand_data[category]
            for model, details in category_models.items():
                if guitar_type is None or details['category'].lower() == guitar_type.lower():
                    models.append({
                        'name': model,
                        'brand': brand,
                        'type': details['category'],
                        'msrp': details['msrp'],
                        'tier': details['tier']
                    })
    
    return models


def search_guitars(query):
    """Search for guitars by brand or model name."""
    results = []
    query_lower = query.lower()
    
    for brand, brand_data in GUITAR_DATABASE.items():
        # Check if brand name matches
        if query_lower in brand.lower():
            # Add all models from this brand
            for category in ['electric', 'acoustic', 'classical', 'bass']:
                if category in brand_data:
                    for model, details in brand_data[category].items():
                        results.append({
                            'brand': brand,
                            'model': model,
                            'type': details['category'],
                            'msrp': details['msrp'],
                            'tier': details['tier']
                        })
        else:
            # Check individual models
            for category in ['electric', 'acoustic', 'classical', 'bass']:
                if category in brand_data:
                    for model, details in brand_data[category].items():
                        if query_lower in model.lower():
                            results.append({
                                'brand': brand,
                                'model': model,
                                'type': details['category'],
                                'msrp': details['msrp'],
                                'tier': details['tier']
                            })
    
    return results


def get_guitar_info(brand, model):
    """Get detailed information about a specific guitar."""
    if brand not in GUITAR_DATABASE:
        return None
    
    brand_data = GUITAR_DATABASE[brand]
    
    for category in ['electric', 'acoustic', 'classical', 'bass']:
        if category in brand_data and model in brand_data[category]:
            details = brand_data[category][model]
            return {
                'brand': brand,
                'model': model,
                'type': details['category'],
                'msrp': details['msrp'],
                'tier': details['tier'],
                'category': category
            }
    
    return None


def get_guitars_by_type(guitar_type):
    """Get all guitars of a specific type (Electric, Acoustic, Classical, Bass)."""
    results = []
    
    for brand, brand_data in GUITAR_DATABASE.items():
        for category in ['electric', 'acoustic', 'classical', 'bass']:
            if category in brand_data:
                for model, details in brand_data[category].items():
                    if details['category'].lower() == guitar_type.lower():
                        results.append({
                            'brand': brand,
                            'model': model,
                            'type': details['category'],
                            'msrp': details['msrp'],
                            'tier': details['tier']
                        })
    
    return results


def get_guitars_by_price_range(min_price, max_price):
    """Get all guitars within a specific price range."""
    results = []
    
    for brand, brand_data in GUITAR_DATABASE.items():
        for category in ['electric', 'acoustic', 'classical', 'bass']:
            if category in brand_data:
                for model, details in brand_data[category].items():
                    if min_price <= details['msrp'] <= max_price:
                        results.append({
                            'brand': brand,
                            'model': model,
                            'type': details['category'],
                            'msrp': details['msrp'],
                            'tier': details['tier']
                        })
    
    return sorted(results, key=lambda x: x['msrp']) 