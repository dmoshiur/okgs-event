import bdData from "./bd-locations.json";

// Name-only hierarchy derived from bangladesh-location-data@1.0.6 (MIT).
export { bdData };
export const divisions = Object.keys(bdData);

export function getDistricts(division) {
  return division && bdData[division] ? Object.keys(bdData[division]) : [];
}

export function getUpazilas(division, district) {
  return division && district && bdData[division]?.[district]
    ? Object.keys(bdData[division][district])
    : [];
}

export function getUnions(division, district, upazila) {
  if (!division || !district || !upazila) return [];
  return bdData[division]?.[district]?.[upazila] || [];
}

export function isValidAddress({ division, district, upazila, union_name }) {
  return (
    divisions.includes(division) &&
    getDistricts(division).includes(district) &&
    getUpazilas(division, district).includes(upazila) &&
    getUnions(division, district, upazila).includes(union_name)
  );
}
