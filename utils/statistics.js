const calcularEstadisticas = (lecturas, campo) => {
    let suma = 0;
    let min = Infinity;
    let max = -Infinity;

    lecturas.forEach((lectura) => {
        const valor = lectura[campo];
        const timestamp = lectura.timestamp;

        if (valor !== undefined) {
            suma += valor;
            if (valor < min) min = valor;
            if (valor > max) max = valor;
        }
    });

    const promedio = Math.round(suma / lecturas.length);

    return {
        promedio,
        min,
        max
    };
};

// Función para actualizar promedios
function updateAverage(currentAvg = 0, newValue, count = 1) {
    return (currentAvg * (count - 1) + newValue) / count;
}

const buildDailyStatistics = (currentJsonInfo, lecturas) => ({
    lastTimeStamp: {
        lastTimeStamp: currentJsonInfo.timestamp
    },
    humedadAmbiente: {
        estadisticas: calcularEstadisticas(lecturas, "humedadAmbiente"),
        actual: currentJsonInfo.humedadAmbiente
    },
    humedadSuelo: {
        estadisticas: calcularEstadisticas(lecturas, "humedadSuelo"),
        actual: currentJsonInfo.humedadSuelo
    },
    iluminacion: {
        estadisticas: calcularEstadisticas(lecturas, "iluminacion"),
        actual: currentJsonInfo.iluminacion
    },
    nivelAgua: {
        estadisticas: calcularEstadisticas(lecturas, "nivelAgua"),
        actual: currentJsonInfo.nivelAgua
    },
    temperaturaAmbiente: {
        estadisticas: calcularEstadisticas(lecturas, "temperaturaAmbiente"),
        actual: currentJsonInfo.temperaturaAmbiente
    },
});

module.exports = { calcularEstadisticas, updateAverage, buildDailyStatistics };
