export const dayOfTheWeekMapper = new Map([
    [0, "日"],
    [1, "一"],
    [2, "二"],
    [3, "三"],
    [4, "四"],
    [5, "五"],
    [6, "六"],
])


export function generateDisplayDate(date) {
    return `${date} 星期${dayOfTheWeekMapper.get(new Date(date).getDay())}`
}
