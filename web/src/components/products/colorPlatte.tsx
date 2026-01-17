"use client";

import { getColorClass } from "@/lib/colorClass";
import { useState } from "react";

export function ColorPlatte({colors}: {colors: string[]}) {
    const [selectedColor, setSelectedColor] = useState(colors[0]);

    const handleColorChange = (color: string) => {
        setSelectedColor(color);
    }

    return (
            <div className="flex gap-2">
                {
                    colors.map((color) => (
                        <button key={color} 
                        className={`${getColorClass(color)} rounded-full w-6 h-6 transition-all duration-300 ${selectedColor === color ? 'border-4 border-gray-400 scale-110' : ''}`} 
                        onClick={() => handleColorChange(color)}></button>
                    ))
                }
            </div>
    )
}
