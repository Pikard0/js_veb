function task1() {
    let fruits = ["банан", "апельсин", "яблуко", "манго"];

    fruits.pop();
    console.log("1. Оновлений масив (без останнього):", fruits);

    fruits.unshift("ананас");
    console.log("2. Додано 'ананас':", fruits);

    fruits.sort().reverse();
    console.log("3. Зворотнє сортування:", fruits);

    let appleIndex = fruits.indexOf("яблуко");
    console.log("4. Індекс 'яблуко':", appleIndex);
}

function task2() {
    let colors = ["червоний", "зелений", "темно-синій", "жовтий", "синій", "світло-синій"];

    let shortest = colors[0];
    let longest = colors[0];
    for (let color of colors) {
        if (color.length < shortest.length) shortest = color;
        if (color.length > longest.length) longest = color;
    }
    console.log("2. Найкоротший:", shortest, "| Найдовший:", longest);

    let blueColors = colors.filter(color => color.includes("синій"));
    console.log("3. Тільки кольори з 'синій':", blueColors);

    let joinedColors = blueColors.join(", ");
    console.log("4-5. Об'єднаний рядок:", joinedColors);
}

function task3() {
    let employees = [
        { name: "Іван", age: 30, position: "дизайнер" },
        { name: "Анна", age: 25, position: "розробник" },
        { name: "Петро", age: 40, position: "менеджер" },
        { name: "Марія", age: 28, position: "розробник" }
    ];

    employees.sort((a, b) => a.name.localeCompare(b.name));
    console.log("2. Відсортовано за іменами:", JSON.parse(JSON.stringify(employees)));

    let developers = employees.filter(emp => emp.position === "розробник");
    console.log("3. Розробники:", developers);

    employees = employees.filter(emp => emp.age <= 35);
    console.log("4. Видалено старших за 35:", JSON.parse(JSON.stringify(employees)));

    employees.push({ name: "Олена", age: 22, position: "тестувальник" });
    console.log("5. Оновлений масив:", employees);
}

function task4() {
    console.log("\n--- Завдання 4 ---");
    let students = [
        { name: "Олексій", age: 20, course: 2 },
        { name: "Ірина", age: 21, course: 3 },
        { name: "Максим", age: 19, course: 1 }
    ];

    students = students.filter(student => student.name !== "Олексій");
    console.log("2. Видалено Олексія:", JSON.parse(JSON.stringify(students)));

    students.push({ name: "Дмитро", age: 22, course: 4 });
    console.log("3. Додано студента:", JSON.parse(JSON.stringify(students)));

    students.sort((a, b) => b.age - a.age);
    console.log("4. Сортування за віком (спадання):", JSON.parse(JSON.stringify(students)));

    let thirdCourseStudent = students.find(student => student.course === 3);
    console.log("5. Студент 3-го курсу:", thirdCourseStudent);
}

function task5() {
    console.log("\n--- Завдання 5 ---");
    let numbers = [1, 2, 3, 4, 5, 6];

    let squared = numbers.map(num => num ** 2);
    console.log("1. Піднесено до квадрату:", squared);

    let evens = numbers.filter(num => num % 2 === 0);
    console.log("2. Тільки парні:", evens);

    let sum = numbers.reduce((acc, curr) => acc + curr, 0);
    console.log("3. Сума масиву:", sum);

    let extraNumbers = [7, 8, 9, 10, 11];
    let combined = numbers.concat(extraNumbers);
    console.log("4. Об'єднаний масив:", combined);

    combined.splice(0, 3);
    console.log("5. Видалено перші 3 елементи:", combined);
}

function task6() {

    function libraryManagement() {
        let library = [
            { title: "Кобзар", author: "Тарас Шевченко", genre: "Поезія", pages: 600, isAvailable: true },
            { title: "Тіні забутих предків", author: "Михайло Коцюбинський", genre: "Повість", pages: 200, isAvailable: false }
        ];

        return {
            addBook: function(title, author, genre, pages) {
                library.push({ title, author, genre, pages, isAvailable: true });
            },
            removeBook: function(title) {
                library = library.filter(book => book.title !== title);
            },
            findBooksByAuthor: function(author) {
                return library.filter(book => book.author === author);
            },
            toggleBookAvailability: function(title, isBorrowed) {
                let book = library.find(b => b.title === title);
                if (book) {
                    book.isAvailable = !isBorrowed;
                }
            },
            sortBooksByPages: function() {
                library.sort((a, b) => a.pages - b.pages);
            },
            getBooksStatistics: function() {
                let totalBooks = library.length;
                let availableBooks = library.filter(b => b.isAvailable).length;
                let borrowedBooks = totalBooks - availableBooks;
                let totalPages = library.reduce((sum, b) => sum + b.pages, 0);
                let avgPages = totalBooks > 0 ? (totalPages / totalBooks).toFixed(0) : 0;

                return { totalBooks, availableBooks, borrowedBooks, avgPages };
            },
            getLibrary: function() { return library; }
        };
    }

    let manager = libraryManagement();
    manager.addBook("Захар Беркут", "Іван Франко", "Повість", 300);
    manager.toggleBookAvailability("Захар Беркут", true);
    console.log("Бібліотека після операцій:", manager.getLibrary());
    console.log("Книги Шевченка:", manager.findBooksByAuthor("Тарас Шевченко"));
    manager.sortBooksByPages();
    console.log("Відсортовано за сторінками:", manager.getLibrary());
    console.log("Статистика:", manager.getBooksStatistics());
}

function task7() {
    let studentObj = { name: "Олександр", age: 19, course: 2 };
    studentObj.subjects = ["Математика", "Програмування", "Бази даних"];
    delete studentObj.age;
    console.log("Оновлений об'єкт студента:", studentObj);
}

task1();
task2();
task3();
task4();
task5();
task6();
task7();