#!/usr/bin/env node
import yargs from "yargs";
import { fetchDutyInfo, setCookie } from "./src/fetchDutyInfo.js";

yargs
    .usage("Usage: $0 <command> [options]")
    .command("clock", "ClockIn Work NUEiP", (yargs) => {
        return yargs
            .options('cookie', {
                describe: "attendance record cookie with current month",
                demandOption: true,
                alias: "c",
            })
    }, (argv) => {
        setCookie(argv.cookie)
        fetchDutyInfo()
    })
    .example("$0 clock -c \"COOKIE\"")
    .help("h")
    .alias("h", "help")
    .argv;


