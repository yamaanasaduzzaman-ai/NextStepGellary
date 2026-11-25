export interface BangladeshDivision {
  name: string;
  districts: string[];
}

export const BANGLADESH_DIVISIONS: BangladeshDivision[] = [
  {
    name: 'Dhaka',
    districts: [
      'Dhaka',
      'Gazipur',
      'Narayanganj',
      'Tangail',
      'Kishoreganj',
      'Manikganj',
      'Munshiganj',
      'Narsingdi',
      'Faridpur',
      'Gopalganj',
      'Madaripur',
      'Rajbari',
      'Shariatpur',
    ],
  },
  {
    name: 'Chattogram',
    districts: [
      'Chattogram',
      'Cox\'s Bazar',
      'Cumilla',
      'Feni',
      'Brahmanbaria',
      'Chandpur',
      'Noakhali',
      'Lakshmipur',
      'Khagrachhari',
      'Rangamati',
      'Bandarban',
    ],
  },
  {
    name: 'Rajshahi',
    districts: [
      'Rajshahi',
      'Bogura',
      'Pabna',
      'Sirajganj',
      'Naogaon',
      'Natore',
      'Chapai Nawabganj',
      'Joypurhat',
    ],
  },
  {
    name: 'Khulna',
    districts: [
      'Khulna',
      'Jashore',
      'Satkhira',
      'Bagerhat',
      'Kushtia',
      'Chuadanga',
      'Meherpur',
      'Jhenaidah',
      'Magura',
      'Narail',
    ],
  },
  {
    name: 'Barishal',
    districts: [
      'Barishal',
      'Bhola',
      'Patuakhali',
      'Pirojpur',
      'Barguna',
      'Jhalokati',
    ],
  },
  {
    name: 'Sylhet',
    districts: [
      'Sylhet',
      'Moulvibazar',
      'Habiganj',
      'Sunamganj',
    ],
  },
  {
    name: 'Rangpur',
    districts: [
      'Rangpur',
      'Dinajpur',
      'Gaibandha',
      'Kurigram',
      'Lalmonirhat',
      'Nilphamari',
      'Panchagarh',
      'Thakurgaon',
    ],
  },
  {
    name: 'Mymensingh',
    districts: [
      'Mymensingh',
      'Jamalpur',
      'Netrokona',
      'Sherpur',
    ],
  },
];

export function isInsideDhakaCity(district: string, area?: string): boolean {
  if (!district) return true;
  return district.trim().toLowerCase() === 'dhaka';
}

export function calculateShippingCharge(
  district: string,
  subtotal: number,
  freeShippingThreshold = 3000,
  insideDhakaFee = 70,
  outsideDhakaFee = 130
): { cost: number; isFree: boolean; isInsideDhaka: boolean; estimatedDays: string } {
  const isInside = isInsideDhakaCity(district);
  if (subtotal >= freeShippingThreshold) {
    return {
      cost: 0,
      isFree: true,
      isInsideDhaka: isInside,
      estimatedDays: isInside ? '1 - 2 Business Days' : '2 - 4 Business Days',
    };
  }

  return {
    cost: isInside ? insideDhakaFee : outsideDhakaFee,
    isFree: false,
    isInsideDhaka: isInside,
    estimatedDays: isInside ? '1 - 2 Business Days' : '2 - 4 Business Days',
  };
}
