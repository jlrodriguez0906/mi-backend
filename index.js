const express = require('express');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// Tarifa fija de $2.0 por hora o fracción
const TARIFA_POR_HORA = 2.0;

// Base de datos en memoria
let vehiculos = [];
let idCounter = 1;

// Mensaje de bienvenida en la raíz
app.get('/', (req, res) => {
    res.json({ mensaje: "API de Control de Parqueadero Lista 🚗" });
});

// GET /api/vehiculos - Listar todos los vehículos
app.get('/api/vehiculos', (req, res) => {
    res.json(vehiculos);
});

// POST /api/vehiculos/ingreso - Registrar un vehículo
app.post('/api/vehiculos/ingreso', (req, res) => {
    const { placa } = req.body;
    if (!placa) {
        return res.status(400).json({ error: 'La placa es requerida' });
    }

    const ahora = new Date();
    const nuevoVehiculo = {
        id: idCounter++,
        placa: placa.toUpperCase(),
        fecha: ahora.toISOString().split('T')[0],
        horaLlegada: ahora.toLocaleTimeString(),
        timestampLlegada: ahora.getTime(),
        horaSalida: null,
        duracionMinutos: null,
        monto: null,
        activo: true
    };

    vehiculos.push(nuevoVehiculo);
    res.status(201).json(nuevoVehiculo);
});

// POST /api/vehiculos/salida/:id - Registrar la salida de un vehículo
app.post('/api/vehiculos/salida/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const vehiculo = vehiculos.find(v => v.id === id && v.activo);

    if (!vehiculo) {
        return res.status(404).json({ error: 'Vehículo activo no encontrado' });
    }

    const ahora = new Date();
    const timestampSalida = ahora.getTime();

    // Cálculo de tiempo en minutos
    const diferenciaMs = timestampSalida - vehiculo.timestampLlegada;
    const duracionMinutos = Math.max(1, Math.ceil(diferenciaMs / (1000 * 60)));

    // Cálculo de cobranza
    const horasACobrar = Math.ceil(duracionMinutos / 60);
    const monto = horasACobrar * TARIFA_POR_HORA;

    // Actualizar registro
    vehiculo.horaSalida = ahora.toLocaleTimeString();
    vehiculo.duracionMinutos = duracionMinutos;
    vehiculo.monto = monto;
    vehiculo.activo = false;

    res.json(vehiculo);
});

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Backend escuchando en http://localhost:${PORT}`);
});