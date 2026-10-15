export const bdData = {
  "Dhaka": {
    "Dhaka": {
      "Dhamrai": ["Amta", "Baishakanda", "Bhararia", "Chauhat", "Kulla"],
      "Dohar": ["Bilaspur", "Kushumhati", "Mahmudpur", "Muksudpur", "Narisha"],
      "Keraniganj": ["Aganagar", "Ati", "Basta", "Hazratpur", "Konda"],
      "Nawabganj": ["Agla", "Barrah", "Churain", "Galimpur", "Joykrishnapur"],
      "Savar": ["Aminbazar", "Ashulia", "Biralia", "Bongaon", "Kaundia"]
    },
    "Gazipur": {
      "Gazipur Sadar": ["Baria", "Bhavwal", "Mirzapur", "Pirujali", "Vawral"],
      "Kaliakair": ["Atabaha", "Boali", "Chapair", "Dhaljora", "Fulbaria"],
      "Kaliganj": ["Bahadursadi", "Baktarpur", "Bhaowal", "Jamalpur", "Jangalia"]
    },
    "Tangail": {
      "Tangail Sadar": ["Baghila", "Danya", "Gala", "Gharinda", "Hugra"],
      "Madhupur": ["Alokdia", "Arankhola", "Aushnara", "Beribaid", "Fulbagchala"]
    }
  },
  "Chattogram": {
    "Chattogram": {
      "Anwara": ["Anwara", "Bairag", "Barakhain", "Barasat", "Battali"],
      "Boalkhali": ["Ahla Karaldenga", "Amuchia", "Charandwip", "Kadurkhil", "Popadia"]
    },
    "Cox's Bazar": {
      "Cox's Bazar Sadar": ["Chowfaldandi", "Eidgaon", "Islampur", "Jhilongjha", "Khurushkul"],
      "Teknaf": ["Baharchhara", "Hnila", "Sabrang", "Saint Martin", "Teknaf"]
    }
  },
  "Rajshahi": {
    "Joypurhat": {
      "Joypurhat Sadar": ["Amdoi", "Bambur", "Bhadsha", "Dogachi", "Jamalpur"],
      "Akkelpur": ["Gopinathpur", "Raikali", "Rukindipur", "Sona Mukhi", "Tilakpur"],
      "Kalai": ["Ahmmadabad", "Jindarpur", "Matrai", "Punot", "Udaypur"],
      "Khetlal": ["Alampur", "Barail", "Bordail", "Mamudpur", "Tulshiganga"],
      "Panchbibi": ["Atapur", "Aolai", "Bagjana", "Balighata", "Kusumba"]
    },
    "Rajshahi": {
      "Boalia": ["Ward 1", "Ward 2", "Ward 3", "Ward 4", "Ward 5"],
      "Paba": ["Borgachi", "Damkur", "Darshanpara", "Harian", "Haripur"]
    },
    "Bogura": {
      "Bogura Sadar": ["Erulia", "Fapore", "Gokul", "Lahiri Para", "Namujha"],
      "Sherpur": ["Bhawannipur", "Bishalpur", "Garidaha", "Khamarkandi", "Kusumbi"]
    },
    "Naogaon": {
      "Naogaon Sadar": ["Baktiarpur", "Balla", "Boalia", "Chandipur", "Dubalhati"],
      "Manda": ["Bhalain", "Bharsho", "Bishnupur", "Ganeshpur", "Kalatala"]
    }
  },
  "Khulna": {
    "Khulna": {
      "Dumuria": ["Atlia", "Dhamalia", "Dumuria", "Ghutudia", "Kharnia"],
      "Phultala": ["Atra Gilatala", "Damodar", "Jamira", "Phultala"]
    },
    "Jessore": {
      "Jessore Sadar": ["Arabpur", "Basundia", "Chanchra", "Churamankati", "Diara"]
    }
  },
  "Barishal": {
    "Barishal": {
      "Barishal Sadar": ["Chandpura", "Char Badna", "Char Kowa", "Char Monai", "Charmohabbatpur"]
    }
  },
  "Sylhet": {
    "Sylhet": {
      "Sylhet Sadar": ["Hatkhola", "Jalalabad", "Khadimnagar", "Khadim Para", "Mogalgaon"]
    }
  },
  "Rangpur": {
    "Rangpur": {
      "Rangpur Sadar": ["Chandanpat", "Haridebpur", "Mominpur", "Pashuram", "Sabyapushkarini"]
    },
    "Dinajpur": {
      "Dinajpur Sadar": ["Askarpur", "Auliapur", "Chehelgazi", "Kamalpur", "Shankarpur"]
    }
  },
  "Mymensingh": {
    "Mymensingh": {
      "Mymensingh Sadar": ["Aqua", "Bairagi Para", "Bora Char", "Boyra", "Char Ishwardia"]
    }
  }
};

// Flat lists for easier consumption
export const divisions = Object.keys(bdData);
export function getDistricts(division) {
  if (!division || !bdData[division]) return [];
  return Object.keys(bdData[division]);
}
export function getUpazilas(division, district) {
  if (!division || !district || !bdData[division]?.[district]) return [];
  return Object.keys(bdData[division][district]);
}
export function getUnions(division, district, upazila) {
  if (!division || !district || !upazila) return [];
  return bdData[division]?.[district]?.[upazila] || [];
}
