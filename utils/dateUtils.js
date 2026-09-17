const getDateParts = (timestamp) => {
    const date = new Date(timestamp);
    return {
        year: date.getFullYear(),
        month: date.getMonth() + 1, // Meses en JS son 0-11
        day: date.getDate(),
    };
};

module.exports = { getDateParts };
