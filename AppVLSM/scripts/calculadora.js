document.getElementById('numSubredes').addEventListener('change', function() {
    var numSubredes = document.getElementById('numSubredes').value;
    var inputsSubred = document.getElementById('inputsSubred');

    // Eliminar los inputs existentes.
    while (inputsSubred.firstChild) {
        inputsSubred.removeChild(inputsSubred.firstChild);
    }

    // Crear nuevos inputs para cada subred.
    for (var i = 0; i < numSubredes; i++) {
        var etiqueta = document.createElement('label');
        etiqueta.textContent = 'Subred ' + (i + 1) + ':';
        inputsSubred.appendChild(etiqueta);
        inputsSubred.appendChild(document.createElement('br'));

        var nombreInput = document.createElement('input');
        nombreInput.type = 'text';
        nombreInput.name = 'nombreSubred' + i;
        nombreInput.id = 'nombreSubred' + i;
        nombreInput.placeholder = 'Nombre';
        inputsSubred.appendChild(nombreInput);

        var hostsInput = document.createElement('input');
        hostsInput.type = 'text';
        hostsInput.name = 'hostsSubred' + i;
        hostsInput.id = 'hostsSubred' + i;
        hostsInput.placeholder = 'Cantidad de hosts';
        inputsSubred.appendChild(hostsInput);

        inputsSubred.appendChild(document.createElement('br'));
    }
});

document.getElementById('formularioVLSM').addEventListener('submit', function(event) {
    event.preventDefault();

    var direccionIP = document.getElementById('direccionIP').value;
    var prefijoSubred = document.getElementById('prefijoSubred').value;
    var numSubredes = document.getElementById('numSubredes').value;

    var subredes = [];
    for (var i = 0; i < numSubredes; i++) {
        var nombreSubred = document.getElementById('nombreSubred' + i).value;
        var hostsSubred = document.getElementById('hostsSubred' + i).value;
        subredes.push({nombre: nombreSubred, hosts: parseInt(hostsSubred)});
    }

    var resultados = calcularVLSM(direccionIP, prefijoSubred, subredes);

    var tablaResultados = document.getElementById('tablaResultados');
    while (tablaResultados.rows.length > 1) {
        tablaResultados.deleteRow(1);
    }
    for (var i = 0; i < resultados.length; i++) {
        var fila = tablaResultados.insertRow(-1);
        fila.insertCell(0).textContent = resultados[i]['Nombre de Subred'];
        fila.insertCell(1).textContent = resultados[i]['Dirección IP de Subred'];
        fila.insertCell(2).textContent = resultados[i]['Máscara de Subred'];
        fila.insertCell(3).textContent = resultados[i]['Gateway'];
        fila.insertCell(4).textContent = resultados[i]['Dirección de Broadcast'];
        fila.insertCell(5).textContent = resultados[i]['Rango de Hosts Utilizables'];
        fila.insertCell(6).textContent = resultados[i]['Cantidad de Hosts'];
    }
});

function calcularVLSM(direccionIP, prefijoSubred, subredes) {
    var partesIP = direccionIP.split('.');
    var baseIP = parseInt(partesIP[3]);
    var resultados = [];

    subredes.sort(function(a, b) {
        return b.hosts - a.hosts;
    });

    for (var i = 0; i < subredes.length; i++) {
        var tamanoSubred = Math.pow(2, Math.ceil(Math.log(subredes[i].hosts + 2) / Math.log(2)));
        var mascaraSubred = 32 - Math.log(tamanoSubred) / Math.log(2);

        // Calcular la máscara de subred en formato decimal punteado.
        var mascaraSubredPunteada = '';
        for (var j = 0; j < 4; j++) {
            var valorOcteto = j < Math.floor(mascaraSubred / 8) ? 255 : (j === Math.floor(mascaraSubred / 8) ? 256 - Math.pow(2, 8 - mascaraSubred % 8) : 0);
            mascaraSubredPunteada += (j > 0 ? '.' : '') + valorOcteto;
        }

        resultados.push({
            'Nombre de Subred': subredes[i].nombre,
            'Dirección IP de Subred': partesIP[0] + '.' + partesIP[1] + '.' + partesIP[2] + '.' + baseIP,
            'Máscara de Subred': '/' + mascaraSubred + ' (' + mascaraSubredPunteada + ')',
            'Gateway': partesIP[0] + '.' + partesIP[1] + '.' + partesIP[2] + '.' + (baseIP + 1),
            'Dirección de Broadcast': partesIP[0] + '.' + partesIP[1] + '.' + partesIP[2] + '.' + (baseIP + tamanoSubred - 1),
            'Rango de Hosts Utilizables': partesIP[0] + '.' + partesIP[1] + '.' + partesIP[2] + '.' + (baseIP + 2) + ' - ' + partesIP[0] + '.' + partesIP[1] + '.' + partesIP[2] + '.' + (baseIP + tamanoSubred - 2),
            'Cantidad de Hosts': tamanoSubred - 2
        });

        baseIP += tamanoSubred;
    }

    return resultados;
}
