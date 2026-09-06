"use client";

import { useState } from "react";
import { Users, Code, BrainCircuit, Terminal, Layout, Microscope, GraduationCap, Building } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const TEAM_MEMBERS = [
    {
        name: "Shikhaa Prabhudesai",
        role: "Team Leader",
        description: "Frontend / UX",
        gender: "Female",
        stream: "COMP",
        academicYear: "BE",
        image: "/shikhaa.png",
        icon: Layout
    },
    {
        name: "Rushikesh Gaonkar",
        role: "Team Member",
        description: "AI / RAG",
        gender: "Male",
        stream: "COMP",
        academicYear: "BE",
        image: "/rushikesh.png",
        icon: BrainCircuit
    },
    {
        name: "Vedant Joshi",
        role: "Team Member",
        description: "App (Flutter)",
        gender: "Male",
        stream: "COMP",
        academicYear: "BE",
        image: "/vedant.png",
        icon: Terminal
    },
    {
        name: "Shridhar Kamat",
        role: "Team Member",
        description: "Full Stack",
        gender: "Male",
        stream: "COMP",
        academicYear: "BE",
        image: "/shridhar.png",
        icon: Code
    },
    {
        name: "Chinmay Gadgil",
        role: "Team Member",
        description: "Backend",
        gender: "Male",
        stream: "COMP",
        academicYear: "BE",
        image: "/chinmay.png",
        icon: Terminal
    },
    {
        name: "Samruddhi Dessai",
        role: "Team Member",
        description: "Research / Domain",
        gender: "Female",
        stream: "COMP",
        academicYear: "BE",
        image: "/samruddhi.png",
        icon: Microscope
    }
];

export default function TeamPage() {
    return (
        <div className="mx-auto w-full max-w-6xl p-4 sm:p-6 lg:p-8 animate-in fade-in duration-500 pb-20">

            {/* Hero Section */}
            <div className="relative rounded-3xl bg-card border border-border p-10 sm:p-16 mb-12 overflow-hidden flex flex-col items-center text-center shadow-lg">
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none flex items-center justify-center bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-foreground via-background to-background">
                    <Users className="w-96 h-96 text-foreground" />
                </div>

                <div className="relative z-10 flex flex-col items-center gap-4">
                    <Badge variant="success" className="animate-in fade-in slide-in-from-bottom-4 duration-700 shadow-sm border border-railway-green/20 bg-railway-green/10 text-railway-green">
                        <span className="w-2 h-2 rounded-full bg-railway-green animate-pulse mr-2" />
                        SMART INDIA HACKATHON
                    </Badge>

                    <h1 className="text-4xl sm:text-6xl font-black text-foreground tracking-tight">
                        Team <span className="text-railway-green">Straw Hats</span>
                    </h1>
                    
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto font-medium leading-relaxed mt-2">
                        Engineering GATI DRISHTI — a next-generation dynamic railway ETA intelligence and network management platform.
                    </p>
                </div>
            </div>

            {/* Team Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {TEAM_MEMBERS.map((member, idx) => {
                    const Icon = member.icon;
                    return (
                        <Card key={idx} className="bg-card border-border shadow-sm hover:shadow-md hover:border-railway-green/30 transition-all duration-300 group overflow-hidden">
                            <CardContent className="p-0">
                                <div className="h-24 bg-muted/50 border-b border-border relative overflow-hidden flex justify-center">
                                    <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent z-10" />
                                    {/* Placeholder Background Pattern */}
                                    <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-railway-green to-transparent" />
                                </div>
                                
                                <div className="relative z-20 -mt-12 flex flex-col items-center px-6 pb-6 text-center">
                                    {/* Avatar */}
                                    <div className="w-24 h-24 rounded-full border-4 border-card bg-muted shadow-md mb-4 overflow-hidden flex items-center justify-center">
                                        {member.image ? (
                                            <img 
                                                src={member.image} 
                                                alt={member.name} 
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    // Fallback to icon if image fails to load
                                                    e.currentTarget.style.display = 'none';
                                                    e.currentTarget.parentElement?.classList.add('bg-muted/80');
                                                }}
                                            />
                                        ) : (
                                            <Users className="w-10 h-10 text-muted-foreground" />
                                        )}
                                    </div>

                                    <h3 className="text-xl font-bold text-foreground mb-1 group-hover:text-railway-green transition-colors">
                                        {member.name}
                                    </h3>
                                    
                                    <p className="text-xs font-bold text-railway-green uppercase tracking-widest mb-3">
                                        {member.role}
                                    </p>
                                    
                                    <div className="flex items-center gap-2 mb-5 px-3 py-1.5 bg-muted rounded-full">
                                        <Icon className="w-4 h-4 text-info-blue" />
                                        <span className="text-sm font-semibold text-foreground/80">{member.description}</span>
                                    </div>

                                    <div className="w-full pt-4 border-t border-border flex items-center justify-center gap-4 text-xs font-medium text-muted-foreground">
                                        <span className="flex items-center gap-1.5 bg-muted/50 px-2.5 py-1 rounded-md">
                                            <Building className="w-3.5 h-3.5" />
                                            {member.stream}
                                        </span>
                                        <span className="flex items-center gap-1.5 bg-muted/50 px-2.5 py-1 rounded-md">
                                            <GraduationCap className="w-3.5 h-3.5" />
                                            {member.academicYear}
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
