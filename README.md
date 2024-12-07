# Proyecto Algoritmos Minimax y Poda Alfa-Beta

## Descripción del Proyecto
Este proyecto implementa una aplicación web interactiva para generar y analizar árboles de decisiones utilizando los algoritmos Minimax y Poda Alfa-Beta.


## Requisitos Previos
- Node.js (versión 14 o superior)
- npm o Yarn


## Instalación y Configuración

### 1. Clonar el Repositorio
```bash
git clone https://github.com/YormanOna/YormanOna_ProyectoExtra.git
cd YormanOna_ProyectoExtra
```

### 2. Instalar Dependencias
Una vez que el repositorio esté clonado, verifique que este en la direccion del archivo del proyecto clonado y ejecute el siguiente comando
#### Usando npm:
```bash
npm install
```

#### Usando Yarn:
```bash
yarn install
```

### 3. Ejecutar el Proyecto

#### Con npm:
```bash
npm run dev
```

#### Con Yarn:
```bash
yarn dev
```

## Uso de la Aplicación

### Generar Árbol de Decisiones
1. Abra la aplicación en http://localhost:3000
2. Utilice los controles del formulario para configurar el árbol:
   - **Profundidad del Árbol**: Seleccione la profundidad deseada
   - **Nodos por Nivel**: Defina el número de nodos en cada nivel
   - **Valores de las Hojas**: Ingrese valores separados por comas
     - Ejemplo: `3, 5, 2, 8`

3. Haga clic en "Generar Árbol"
4. Una vez generado el árbol, se tiene que conectar los nodos con las ramas que se desee. Para hacerlo:
    - Haga clic en el punto que aparece en la parte superior del nodo que deseas conectar.
    - Mantenga presionado el clic y arrástralo hacia el nodo al que quieres unirlo.
    - Suelta el clic cuando el nodo de destino esté seleccionado para crear la conexión.

### Ejecutar Algoritmos
1. Seleccione un algoritmo del menú desplegable:
   - Minimax
   - Poda Alfa-Beta
2. Haga clic en "Ejecutar Algoritmo"

### Reiniciar el Árbol
- Utilice el botón "Resetear Árbol" para limpiar la configuración actual y comenzar de nuevo


## Tecnologías Utilizadas
- Vite
- React
- TypeScript



## Contacto
- Autor: Yorman Oña
- GitHub: [YormanOna](https://github.com/YormanOna)

## Problemas Frecuentes
- Asegúrese de tener instaladas todas las dependencias
- Verifique que la versión de Node.js sea compatible
- Compruebe que no haya conflictos de puerto en localhost


