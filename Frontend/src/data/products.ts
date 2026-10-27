export interface Product {
  id: number;
  name: string;
  slug: string;
  price: number;
  mrp: number;
  weight: string;
  image: string;
  badges: string[];
  category: 'Makhana' | 'Cookies' | 'Combo';
  description: string;
}

export const products: Product[] = [
  {
    id: 1,
    name: 'Premium Phool Makhana',
    slug: '500g-premium-phool-makhana',
    price: 649,
    mrp: 799,
    weight: '500g',
    image: 'https://images.pexels.com/photos/7051132/pexels-photo-7051132.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    badges: ['Baked, Not Fried', 'High in Protein', 'Gluten-Free'],
    category: 'Makhana',
    description: 'Hand-picked fox nuts from the ponds of Mithila, slow-baked to a golden crunch. Light, airy and naturally rich in protein.',
  },
  {
    id: 2,
    name: 'Salt & Pepper Baked Makhana',
    slug: 'salt-pepper-baked-makhana',
    price: 299,
    mrp: 399,
    weight: '250g',
    image: 'https://images.pexels.com/photos/10111993/pexels-photo-10111993.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    badges: ['Himalayan Salt', 'Zero Oil', 'Vrat Friendly'],
    category: 'Makhana',
    description: 'Premium baked makhana seasoned with Himalayan pink salt and cracked pepper. The perfect guilt-free evening snack.',
  },
  {
    id: 3,
    name: 'Pudina Green Twist Makhana',
    slug: 'pudina-green-twist-makhana',
    price: 299,
    mrp: 399,
    weight: '250g',
    image: 'https://images.pexels.com/photos/8817793/pexels-photo-8817793.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    badges: ['Mint Flavour', 'Baked, Not Fried', 'No Preservatives'],
    category: 'Makhana',
    description: 'A refreshing twist of mint and spices on crunchy baked makhana. Zesty, light and impossible to put down.',
  },
  {
    id: 4,
    name: 'Sugar-Free Makhana Cookies',
    slug: 'sugar-free-makhana-cookies',
    price: 249,
    mrp: 349,
    weight: '200g',
    image: 'https://images.pexels.com/photos/23948793/pexels-photo-23948793.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    badges: ['Sugar-Free', 'Millet Rich', 'Diabetic Friendly'],
    category: 'Cookies',
    description: 'Delightfully tasty cookies made with makhana and millet. No sugar, no compromise — just wholesome goodness.',
  },
  {
    id: 5,
    name: '1Kg Premium Phool Makhana',
    slug: '1kg-premium-phool-makhana',
    price: 1199,
    mrp: 1499,
    weight: '1Kg',
    image: 'https://images.pexels.com/photos/5472169/pexels-photo-5472169.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    badges: ['Family Pack', 'Best Value', '100% Natural'],
    category: 'Makhana',
    description: 'Our best-value pack for makhana lovers. A full kilogram of premium-grade fox nuts, freshly packed in Darbhanga.',
  },
  {
    id: 6,
    name: 'Coconut Makhana Bites',
    slug: 'coconut-makhana-bites',
    price: 279,
    mrp: 379,
    weight: '250g',
    image: 'https://images.pexels.com/photos/28664619/pexels-photo-28664619.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    badges: ['Coconut Flavour', 'Baked, Not Fried', 'Gluten-Free'],
    category: 'Cookies',
    description: 'Crunchy makhana bites coated in real coconut. A tropical twist on Bihar\u2019s favourite superfood snack.',
  },
];

export interface Testimonial {
  id: number;
  name: string;
  location: string;
  rating: number;
  text: string;
  product: string;
}

export const testimonials: Testimonial[] = [
  {
    id: 1,
    name: 'Priya Sharma',
    location: 'Mumbai, Maharashtra',
    rating: 5,
    text: 'The salt & pepper makhana is incredibly fresh and crunchy. Perfect for my evening tea. Knowing it\u2019s baked and not fried makes it even better!',
    product: 'Salt & Pepper Makhana',
  },
  {
    id: 2,
    name: 'Rahul Verma',
    location: 'Bengaluru, Karnataka',
    rating: 5,
    text: 'Ordered the 1Kg family pack and it lasted exactly a week — my kids couldn\u2019t stop eating them. Premium quality and great packaging.',
    product: '1Kg Premium Phool Makhana',
  },
  {
    id: 3,
    name: 'Anjali Gupta',
    location: 'Delhi, NCR',
    rating: 5,
    text: 'As a diabetic, finding tasty sugar-free snacks is hard. These makhana cookies are a game-changer. Delicious and guilt-free!',
    product: 'Sugar-Free Makhana Cookies',
  },
  {
    id: 4,
    name: 'Vikram Singh',
    location: 'Pune, Maharashtra',
    rating: 5,
    text: 'The pudina flavour is so refreshing! I carry a pack to office every day. Best healthy snack I\u2019ve found online. Highly recommend.',
    product: 'Pudina Green Twist Makhana',
  },
  {
    id: 5,
    name: 'Sneha Reddy',
    location: 'Hyderabad, Telangana',
    rating: 5,
    text: 'Sourced from Mithila — you can taste the authenticity. The makhana is light, airy and perfectly roasted. Will reorder for sure.',
    product: 'Premium Phool Makhana',
  },
];
