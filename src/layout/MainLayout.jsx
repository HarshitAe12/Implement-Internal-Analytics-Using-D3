import { Outlet } from "react-router-dom";
import { useState } from "react";
import DateRangeFilter from "@/components/dashboard/DateRangeFilter";

const MainLayout = () => {
    const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    window.location.href="/"
};
    const defaultRange = (() => {
        const end = new Date();
        const start = new Date();
        start.setDate(end.getDate() - 30);

        return {
            start: start.toISOString().split("T")[0],
            end: end.toISOString().split("T")[0],
        };
    })();

    const [dateRange, setDateRange] = useState(defaultRange);

    return (
        <div className="min-h-screen bg-background">

            {/* HEADER */}
            <header className="sticky top-0 z-20 backdrop-blur-xl bg-background/80 border-b border-border">
                <div className="mx-auto px-6 max-w-[1440px]">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between py-3">

                        {/* Left Branding */}
                        <div className="flex flex-col md:flex-row items-center gap-4 min-w-0">

                            {/* Logo */}
                            <div className="w-44 h-20 shrink-0 flex items-center justify-center">
                                <img
                                    src="https://proinsight.com/wp-content/uploads/2024/07/ProInsight-Logo-1-1-768x219.png"
                                    alt="ProInsight"
                                    className="w-full h-auto object-contain"
                                />
                            </div>

                            {/* Text Content */}
                            <div className="leading-tight min-w-0 text-center md:text-left">
                                <h1 className="mb-1 text-sm font-semibold tracking-tight text-foreground truncate">
                                    ProInsight Analytics
                                </h1>

                                <div className="flex items-center justify-center md:justify-start gap-2 text-xs">
                                    <span className="font-mono text-muted-foreground">
                                        Internal
                                    </span>
                                    <span className="text-muted-foreground">•</span>
                                    <span className="font-mono text-primary">
                                        Dev Data Lake
                                    </span>
                                </div>
                            </div>

                        </div>

                        {/* Right Controls */}
                        <div className="flex flex-col md:flex-row items-center gap-3 w-full md:w-auto shrink-0">
                            <div className="rounded-lg border border-border bg-card/70 px-2 py-1 w-full sm:w-auto shadow-sm">
                                <DateRangeFilter
                                    onRangeChange={(start, end) =>
                                        setDateRange({ start, end })
                                    }
                                />
                            </div>
                            <button
                                onClick={handleLogout}
                                className="px-4 py-2 text-sm font-medium rounded-lg bg-red-500 text-white hover:bg-red-600 transition"
                            >
                                Logout
                            </button>
                        </div>

                    </div>
                </div>
            </header>

            <div className="border-t border-slate-200 pt-4">
                <div className="mx-auto max-w-[1440px] px-6">
                    <div className="flex flex-col md:flex-row items-center justify-between text-xs font-mono text-slate-500">
                        <span>ProInsight Analytics · Internal Use Only</span>
                        <span>
                            Data range: {dateRange.start || "Last 30 days"}
                            {dateRange.end ? ` → ${dateRange.end}` : ""}
                        </span>
                    </div>
                </div>
            </div>



            {/* Pass dateRange to all pages */}
            <main className="max-w-[1440px] mx-auto px-6 py-6">
                <Outlet context={{ dateRange }} />
            </main>

        </div>
    );
};

export default MainLayout;