"use client";
import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { cn } from "./cn";
import DocSearch from '@/app/components/DocSearch'

const transition = {
    type: "spring",
    mass: 0.5,
    damping: 11.5,
    stiffness: 100,
    restDelta: 0.001,
    restSpeed: 0.001,
};

export const MenuItem = ({
    setActive,
    active,
    item,
    children,
}) => {
    return (
        <div onMouseEnter={() => setActive(item)} className="relative ">
            <motion.p
                transition={{ duration: 0.3 }}
                className="cursor-pointer text-white hover:opacity-[0.9] dark:text-white"
            >
                {item}
            </motion.p>
            {active !== null && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.85, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={transition}
                >
                    {active === item && (
                        <div className="absolute top-[calc(100%_+_0rem)] left-1/2 transform -translate-x-1/2 pt-4">
                            <motion.div
                                transition={transition}
                                layoutId="active" // layoutId ensures smooth animation
                                className="bg-white dark:bg-black backdrop-blur-sm rounded-2xl overflow-hidden border border-black/[0.2] dark:border-white/[0.2] shadow-xl"
                            >
                                <motion.div
                                    layout // layout ensures smooth animation
                                    className="w-max h-full p-4"
                                >
                                    {children}
                                </motion.div>
                            </motion.div>
                        </div>
                    )}
                </motion.div>
            )}
        </div>
    );
};

export const Menu = ({
    setActive,
    children,
}) => {
    return (
        <nav
            style={{
                boxShadow: '2px 2px var(--w-green-dark), 4px 4px var(--w-black-dark)'
            }}
            onMouseLeave={() => setActive(null)} // resets the state
            className="relative rounded-full boder justify-between items-center border-transparent dark:bg-black dark:border-white/[0.2] bg-black shadow-input flex space-x-4 px-8 py-2 "
        >
            {children}
        </nav>
    );
};

export const ProductItem = ({
    title,
    description,
    href,
    src,
}) => {
    return (
        <Link href={href} className="flex space-x-2">
            <Image
                src={src}
                width={140}
                height={70}
                alt={title}
                className="flex-shrink-0 rounded-md shadow-2xl"
            />
            <div>
                <h4 className="text-xl font-bold mb-1 text-white dark:text-white">
                    {title}
                </h4>
                <p className="text-neutral-700 text-sm max-w-[10rem] dark:text-neutral-300">
                    {description}
                </p>
            </div>
        </Link>
    );
};

export const HoveredLink = ({ children, ...rest }) => {
    return (
        <Link
            {...rest}
            className="text-neutral-700 dark:text-neutral-200 hover:font-bold"
        >
            {children}
        </Link>
    );
};

export default function Navbar({ className }) {
    const [active, setActive] = React.useState(null);
    return (
        <div
            className={cn("fixed inset-x-0 max-w-[25rem] mx-auto z-50", className)}
        >
            <Menu setActive={setActive}>
                <a href="/" className="text-white flex items-center">
                    <Image alt="notebook" src="/logo.png" width={24} height={24} />
                    首页
                </a>
                <a href="https://github.com/sunwu51/notebook" className="text-white flex items-center gap-1">
                    <Image alt="github" src="/github-mark-white.png" width={16} height={16} />
                    github
                </a>
                <DocSearch />
            </Menu>
        </div >
    );
}