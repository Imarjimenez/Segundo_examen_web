const entradaDeTexto = document.getElementById("in1");
const boton = document.getElementById("buttonSearch");
const botonEvolucion = document.getElementById("buttonEvolution");
const contenedorInfo = document.getElementById("containerInfo");
const nombrePokemon = document.getElementById("pokemonName");
const imagenPokemon = document.getElementById("pokemonImg");
const tipoPokemon = document.getElementById("pokemonType");
const descripcionPokemon = document.getElementById("pokemonDescrition");
const habilidadesPokemon = document.getElementById("pokemonAbilities");
const contenedorBotonEvolucion = document.getElementById("containerEvolution");
const contenedorError = document.getElementById("containerError");

let evolucionEndpoint = "";

boton.addEventListener("click", async () => {
  contenedorBotonEvolucion.style.display = "none";
  contenedorError.style.display = "none";

  const entrada = entradaDeTexto.value;

  const pokemon = await obtenerPorNombre(entrada);
  let pokemonNombre = "";
  let evoluciones = {};

  if (pokemon) {
    pokemonNombre = pokemon.name;
    const especies = await obtenerPorNumeroDeEspecie(pokemon.species.url);
    evoluciones = await obtenerPorCadenaDeEvolucion(
      especies.evolution_chain.url
    );

    contenedorInfo.style.display = "block";
    llenarDatos(pokemon, especies);
  } else {
    contenedorError.style.display = "block";
    return;
  }

  if (
    evoluciones.chain.evolves_to.length > 0 &&
    evoluciones.chain.evolves_to[0].evolves_to[0].species.name !== pokemonNombre
  ) {
    contenedorBotonEvolucion.style.display = "block";
    evolucionEndpoint =
      evoluciones.chain.evolves_to[0].evolves_to[0].species.url;
  } else {
    contenedorBotonEvolucion.style.display = "none";
  }
});

botonEvolucion.addEventListener("click", async () => {
  const match = evolucionEndpoint.match(/(\d+)\/?$/);

  const evolucion = await obtenerPorNombre(match[1]);
  const evolucionNombre = evolucion.name;
  const especies = await obtenerPorNumeroDeEspecie(evolucion.species.url);
  const evoluciones = await obtenerPorCadenaDeEvolucion(
    especies.evolution_chain.url
  );

  if (
    evoluciones.chain.evolves_to.length > 0 &&
    evoluciones.chain.evolves_to[0].evolves_to[0].species.name !==
      evolucionNombre
  ) {
    contenedorBotonEvolucion.style.display = "block";
    evolucionEndpoint =
      evoluciones.chain.evolves_to[0].evolves_to[0].species.url;
  } else {
    contenedorBotonEvolucion.style.display = "none";
  }

  llenarDatos(evolucion, especies);
});

async function obtenerPorNombre(nombre) {
  try {
    const pokemon = await fetch(`https://pokeapi.co/api/v2/pokemon/${nombre}`);

    if (!pokemon.ok) {
      return null;
    }
    return pokemon.json();
  } catch (error) {
    return null;
  }
}

async function obtenerPorNumeroDeEspecie(endpoint) {
  const pokemon = await fetch(endpoint);

  return pokemon.json();
}

async function obtenerPorCadenaDeEvolucion(endpoint) {
  const pokemon = await fetch(endpoint);

  return pokemon.json();
}

function llenarDatos(pokemon, especies) {
  nombrePokemon.innerText = pokemon.name;
  imagenPokemon.src = pokemon.sprites.front_default;
  tipoPokemon.innerText = pokemon.types[0].type.name;
  descripcionPokemon.innerText = especies.flavor_text_entries[26].flavor_text;
  habilidadesPokemon.innerText = pokemon.abilities
    .map((ability) => ability.ability.name)
    .join(", ");
}

function manejadorEvolucion() {
  contenedorBotonEvolucion.style.display = "block";
  botonEvolucion.innerText = "Siguiente evolución";
  botonEvolucion.addEventListener("click", async () => {
    const evolucion = await obtenerPorNombre(evolucionEndpoint);
    llenarDatos(evolucion);
  });
}
