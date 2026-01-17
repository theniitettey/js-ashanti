import { ShopwithUs } from "@/components/whyShopwithus";
import { FaFacebook, FaInstagram, FaLinkedin, FaTwitter } from "react-icons/fa";
import Link from "next/link";

const shop = [
    {
        name: "Kitchen Appliances",
        link: "/products#kitchen-appliances",
    },  {
        link: "/products#cooking-ware",
        name: "CookWare",
    }, {
        name: "Insulations & Food Storage",
        link: "/products#insulations",
    }, {
        name: "Home Essentials",
        link: "/products#home-essentials",
    }
]

const socialLinks = [
    { icon: <FaInstagram className="size-5" />, href: "#", label: "Instagram" },
    { icon: <FaFacebook className="size-5" />, href: "#", label: "Facebook" },
    { icon: <FaTwitter className="size-5" />, href: "#", label: "Twitter" },
    { icon: <FaLinkedin className="size-5" />, href: "#", label: "LinkedIn" },
  ];

const legalLinks = [
    { name: "Return Policy", href: "#" },
    { name: "Privacy Policy", href: "#" },
];

export function Footer(){
    const year = new Date().getFullYear();
    const copyright = `© ${year} J's Ashanti. All rights reserved.`;

    return(
        <footer className="bottom-0 left-0 w-full z-50 font-medium justify-baseline border-t-1 " >
            <div className="container mx-auto max-w-7xl px-4 py-4 mt-6">

                <div className="grid grid-cols-2 lg:grid-cols-3 items-start mt-6 gap-10">
                    <div className="items-start">
                        <h1 className="text-lg md:text-xl font-semibold logo">J's Ashanti's</h1>
                        <p className="text-sm md:text-[18px] text-gray-500 font-normal w-48 xl:w-96">Your trusted partner for premium home and kitchen appliances with expert service and competitive prices.</p>
                        <ul className="flex items-center space-x-6 text-muted-foreground mt-4">
                        {socialLinks.map((social, idx) => (
                            <li key={idx} className="font-medium hover:text-primary">
                            <a href={social.href} aria-label={social.label}>
                                {social.icon}
                            </a>
                            </li>
                        ))}
                        </ul>
                        <div className="mt-4 grid grid-cols-1 items-start gap-2">
                            <h2 className="text-xs md:text-lg font-semibold">Contact Info:</h2>
                            <h3 className="text-gray-500">+233 <span className="text-red-700 italic ">(0)</span> 20 194 4235</h3>
                        </div>
                    </div>

                    <div className="flex flex-col">
                        <h2 className="text-lg font-semibold">Shop</h2>
                        <ul className="flex flex-col gap-2">
                            {shop.map((item, index) => (
                                <li key={index}>
                                    <Link href={item.link} className="text-md md:text-[16px] hover:text-red-700 transition-colors text-gray-500 duration-300">{item.name}</Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Social Media Links */}
                    <div className="items-start">
                        {/* Why shop with us */}
                        {/* <ShopwithUs /> */}
                       
                    </div> 
                </div>

                <div className="mt-8 flex flex-col justify-between gap-4 border-t py-8 text-xs font-medium text-muted-foreground md:flex-row md:items-center md:text-left">
                <p className="order-2 lg:order-1">{copyright}</p>
                
                <ul className="order-1 flex flex-col gap-2 md:order-2 md:flex-row">
                    {legalLinks.map((link, idx) => (
                    <li key={idx} className="hover:text-primary">
                        <a href={link.href}> {link.name}</a>
                    </li>
                    ))}
                </ul>
                </div>

            { /* Store Location */}
                <div className="mt-8">
                    <div className="w-full h-64 rounded-lg overflow-hidden">
                        <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3970.626041369327!2d-0.1759303884417308!3d5.622100294335441!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xfdf9b13b0062aad%3A0x75de9717e31b2442!2sAccra%20Mall!5e0!3m2!1sen!2sgh!4v1750470204632!5m2!1sen!2sgh" 
                        width="100%"
                        height="100%" style={{ border: 0 }}
                        allowFullScreen
                        referrerPolicy="no-referrer-when-downgrade"
                        loading="lazy"></iframe>
                    </div>

                </div>

            </div> 
        </footer>
    )
}