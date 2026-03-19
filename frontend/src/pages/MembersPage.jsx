import Layout from "@/components/Layout";
import { useQuery } from "@tanstack/react-query";
import { adminAPI } from "@/api/admin.api";
import { motion } from "framer-motion";
import { Users, Mail, Shield, ShieldCheck, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function MembersPage() {
    const { data: usersData, isLoading, isError, refetch } = useQuery({
        queryKey: ["all-members"],
        queryFn: () => adminAPI.getUsers({ limit: 100 }),
    });

    const members = usersData?.data?.users || [];

    return (
        <Layout>
            <div className="container mx-auto px-4 py-12">
                <div className="mb-12 text-center relative">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-acm-blue/5 rounded-full blur-3xl pointer-events-none" />
                    <h1 className="text-4xl font-black tracking-tight mb-4 uppercase italic relative z-10">Chapter Members</h1>
                    <p className="text-muted-foreground max-w-2xl mx-auto relative z-10">
                        Explore the talented individuals contributing to our ACM student chapter.
                    </p>
                </div>

                {isLoading ? (
                    <div className="flex justify-center py-20">
                        <Loader />
                    </div>
                ) : (isError || members.length === 0) ? (
                    <div className="text-center py-20 px-6 bg-muted/5 rounded-[3rem] border-2 border-dashed border-border/50 max-w-xl mx-auto flex flex-col items-center">
                        <Users className="h-16 w-16 text-muted-foreground/30 mb-6" />
                        <h3 className="text-2xl font-black uppercase italic">No members found</h3>
                        <p className="text-muted-foreground mt-2 max-w-xs">
                            {isError
                                ? "The member directory is currently in offline mode. Please verify your connection."
                                : "The community directory is currently empty. Be the first to join!"}
                        </p>
                        {isError && (
                            <Button variant="outline" onClick={() => refetch()} className="mt-8 rounded-2xl px-8 font-black uppercase italic tracking-widest text-[10px] hover:bg-acm-blue/10 border-acm-blue/30 text-acm-blue transition-all">
                                RE-STABLISH CONNECTION
                            </Button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {members.map((member, index) => (
                            <motion.div
                                key={member.uid || index}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <Card className="rounded-[2rem] border-border/50 bg-card/40 backdrop-blur-sm transition-all hover:border-acm-blue/50 hover:shadow-acm-glow overflow-hidden group">
                                    <CardContent className="p-6">
                                        <div className="flex items-center gap-4">
                                            <Avatar className="h-16 w-16 rounded-2xl border-2 border-background shadow-lg">
                                                <AvatarImage src={member.photoURL} />
                                                <AvatarFallback className="bg-acm-blue text-white font-bold text-xl">
                                                    {(member.name || member.email || "?").charAt(0).toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-bold text-lg truncate group-hover:text-acm-blue transition-colors">
                                                    {member.name || "Community Member"}
                                                </h3>
                                                <p className="text-xs text-muted-foreground truncate mb-2">{member.email}</p>
                                                <div className="flex items-center gap-2">
                                                    <Badge variant="outline" className="border-acm-blue/30 text-acm-blue bg-acm-blue/5 h-5 font-bold uppercase tracking-widest text-[8px]">
                                                        {member.role || "MEMBER"}
                                                    </Badge>
                                                    {member.role === 'admin' && <ShieldCheck className="h-3.5 w-3.5 text-acm-blue" />}
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </Layout>
    );
}
