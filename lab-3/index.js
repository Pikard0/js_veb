
function task1() {
    let sum = 0;
    let n1 = 0, n2 = 1, nextTerm;
    let count = 1;


    while (count <= 10) {
        sum += n1;
        nextTerm = n1 + n2;
        n1 = n2;
        n2 = nextTerm;
        count++;
    }
    console.log("Сума 10 чисел Фібоначчі ", sum);
}


function task2() {
    let sum = 0;
    for (let i = 2; i <= 1000; i++) {
        let isPrime = true;
        for (let j = 2; j <= Math.sqrt(i); j++) {
            if (i % j === 0) {
                isPrime = false;
                break;
            }
        }
        if (isPrime) {
            sum += i;
        }
    }
    console.log("Сума простих чисел від 1 до 1000 ", sum);
}

function task3(dayNum) {
    let dayStr = "";
    switch (dayNum) {
        case 1: dayStr = "Понеділок"; break;
        case 2: dayStr = "Вівторок"; break;
        case 3: dayStr = "Середа"; break;
        case 4: dayStr = "Четвер"; break;
        case 5: dayStr = "П'ятниця"; break;
        case 6: dayStr = "Субота"; break;
        case 7: dayStr = "Неділя"; break;
        default: dayStr = "Невірний номер дня (введіть від 1 до 7)";
    }
    console.log(`День тижня під номером ${dayNum} - ${dayStr}`);
}

function task4(arr) {
    let result = arr.filter(str => str.length % 2 !== 0);
    console.log("Рядки з непарною довжиною ", result);
    return result;
}

const task5 = (arr) => {
    let result = arr.map(num => num + 1);
    console.log("Збільшений на 1 масив ", result);
    return result;
};

function task6(a, b) {
    let isTen = (a + b === 10) || (Math.abs(a - b) === 10);
    console.log(`Чи дорівнює сума/різниця ${a} та ${b} десяти?`, isTen);
    return isTen;
}

task1();
task2();
task3(4);
task4(["яблуко", "кіт", "собака", "ліс"]);
task5([10, 20, 30]);
task6(15, 5);
task6(4, 6);