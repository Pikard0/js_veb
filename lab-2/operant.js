function getMinMax(arr) {
    if (arr.length === 0) return "Масив порожній";
    let min = arr[0];
    let max = arr[0];
    for (let i = 1; i < arr.length; i++) {
        if (arr[i] > max) max = arr[i];
        if (arr[i] < min) min = arr[i];
    }
    return { min: min, max: max };
}

console.log(getMinMax([5, 2, 9, 1, 7]));


const student1 = { name: "Іван", age: 20 };
const student2 = { name: "Іван", age: 20 };
const student3 = { name: "Марія", age: 22 };

function compareObjects(obj1, obj2) {
    if (obj1.name === obj2.name && obj1.age === obj2.age) {
        return "Об'єкти однакові";
    } else {
        return "Об'єкти відрізняються";
    }
}
console.log("student1 та student2:", compareObjects(student1, student2));
console.log("student1 та student3:", compareObjects(student1, student3));


function isNumberInRange(num, min, max) {
    return num >= min && num <= max;
}

console.log("15 в діапазоні 10-20?", isNumberInRange(15, 10, 20));
console.log("5 в діапазоні 10-20?", isNumberInRange(5, 10, 20));


let isActive = true;
console.log("Початковий стан:", isActive);
isActive = !isActive;
console.log("Стан після використання NOT:", isActive);
isActive = !isActive;
console.log("Стан після повторного NOT:", isActive);



function getGradeDescription(grade) {
    if (grade >= 90 && grade <= 100) {
        return "відмінно";
    } else if (grade >= 75) {
        return "добре";
    } else if (grade >= 60) {
        return "задовільно";
    } else if (grade >= 0) {
        return "незадовільно";
    } else {
        return "Невірна оцінка";
    }
}

console.log("Оцінка 85:", getGradeDescription(85));
console.log("Оцінка 45:", getGradeDescription(45));

function getSeasonUsingIf(month) {
    if (month >= 1 && month <= 12) {
        if (month === 12 || month === 1 || month === 2) {
            return "Зима";
        } else if (month >= 3 && month <= 5) {
            return "Весна";
        } else if (month >= 6 && month <= 8) {
            return "Літо";
        } else {
            return "Осінь";
        }
    } else {
        return "Невірний місяць";
    }
}

function getSeasonUsingTernary(month) {
    return (month === 12 || month === 1 || month === 2) ? "Зима" :
        (month >= 3 && month <= 5) ? "Весна" :
            (month >= 6 && month <= 8) ? "Літо" :
                (month >= 9 && month <= 11) ? "Осінь" :
                    "Невірний місяць";
}
console.log("Місяць 4 (через вкладені if):", getSeasonUsingIf(4));
console.log("Місяць 10 (через тернарний оператор ?):", getSeasonUsingTernary(10));