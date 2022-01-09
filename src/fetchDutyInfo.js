import fetch from "node-fetch";
import FormData from "form-data";
import { generateDisplayDate } from "./utils/generateDisplayDate.js";

let COOKIE = "";

function clockInDuty(date, u_sn, section, hour, min) {
    const formForRequest = new FormData();
    formForRequest.append('hour', hour);
    formForRequest.append('min', min || '00');
    formForRequest.append('remark', '補卡');
    formForRequest.append('date', date);
    formForRequest.append('section', section);
    formForRequest.append('u_sn', u_sn);

    fetch('https://cloud.nueip.com/attendance_record/addCorrectionPunch', {
        method: 'post',
        body: formForRequest,
        headers: { Cookie: COOKIE},
    })
        .catch((e) => console.log("err", e))
}

async function clockInForDay(date, u_sn) {
    await clockInDuty(date, u_sn, '1', '09')
    await clockInDuty(date, u_sn, '2', '18')
    console.log(`${generateDisplayDate(date)} 成功打卡 09:00-18:00`)
}

async function clockInForDayWithTimeOff(date, u_sn, timeoff) {
    const splitTimeOff = timeoff.split("-") // ["14:00", "18:00"]
    let timeMsg = ""
    if (splitTimeOff[0] > '09:00') {
        const [hour, minute] = splitTimeOff[0].split(":")
        await clockInDuty(date, u_sn, '1', '09')
        await clockInDuty(date, u_sn, '2', hour, minute)
        timeMsg += ` 09:00-${hour}:${minute}`
    }
    if (splitTimeOff[1] < '18:00') {
        const [hour, minute] = splitTimeOff[1].split(":")
        await clockInDuty(date, u_sn, '1', hour, minute)
        await clockInDuty(date, u_sn, '2', '18')
        timeMsg += ` ${hour}:${minute}-18:00`
    }
    console.log(`${generateDisplayDate(date)} 成功打卡 ${timeMsg}`)
}

async function clockInForMiss(date, u_sn, onPunch) {
    if (onPunch.section === "1") {
        await clockInDuty(date, u_sn, '2', '18')
        console.log(`${generateDisplayDate(date)} 成功補卡 18:00`)
    }
    if (onPunch.section === "2") {
        await clockInDuty(date, u_sn, '1', '09')
        console.log(`${generateDisplayDate(date)} 成功補卡 09:00`)
    }
}


export function fetchDutyInfo() {
    const form = new FormData();
    form.append('action', 'attendance');
    form.append('loadInBatch', '1');
    form.append('loadBatchGroupNum', '6000');
    form.append('loadBatchNumber', '1');
    form.append('work_status', '1,4');

    fetch('https://cloud.nueip.com/attendance_record/ajax', {
        method: 'post',
        body: form,
        headers: { Cookie: COOKIE},
    })
        .then(res => res.json())
        .then(res => {
            Object.keys(res.data).forEach(async (date) => {
                const idObj = res.data[date]
                const u_sn = Object.keys(idObj)[0]
                const info = idObj[u_sn]

                if (info.attendance && info.attendance.excel !== "") {
                    if (info.attendance.excel === '曠職') {
                        if (!info.timeoff) {
                            await clockInForDay(date, u_sn)
                        } else {
                            const timeoffArr = info.timeoff
                            if (timeoffArr.length > 1) {
                                console.log(`${date}請假太複雜, 請手動打卡^_^`)
                            } else {
                                const timeoff = timeoffArr[0].time // "14:00-18:00"
                                console.log(`${date} ${timeoff}請假`)
                                await clockInForDayWithTimeOff(date, u_sn, timeoff)
                            }

                        }
                    }

                    if (info.attendance.excel === '缺卡' && !info.timeoff) {
                        const onPunch = info.punch.onPunch[0]
                        await clockInForMiss(date, u_sn, onPunch)
                    }
                } else {
                    console.log(`${generateDisplayDate(date)} 不需打卡`)
                }
            })
        });

}

export function setCookie(cookie) {
    COOKIE = cookie
}
