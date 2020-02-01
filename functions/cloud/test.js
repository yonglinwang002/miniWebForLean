var date = '02-01 10:45'
let fullDate = '2020-' + date;

console.log(fullDate)

let convertDate = new Date(fullDate)
console.log(convertDate.toLocaleTimeString())