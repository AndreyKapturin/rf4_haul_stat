import { lures_list, fish_list } from './data.js';

const fishpond = [];
const fish_fieldset = document.querySelector('#fish_fieldset');
const stat = {};
const table = document.querySelector('#table');
const unique_fish = new Map();

//============================================================================
// Создание выпадающих списков для инпутов

const lure_datalist = document.createElement('datalist');
lure_datalist.id = 'lures';
lures_list.forEach((lure) => lure_datalist.appendChild(createOption(lure)));

const fish_datalist = document.createElement('datalist');
fish_datalist.id = 'fish_list';
fish_list.forEach((fish) => fish_datalist.appendChild(createOption(fish.name)));

document.body.append(lure_datalist, fish_datalist);

function createOption(text) {
  const option = document.createElement('option');
  option.textContent = text;
  option.value = text;
  return option;
}


//============================================================================
// Создание формы добавления улова


const form = document.querySelector('#form');
const lure = document.querySelector('#lure');
const change_btn = document.querySelector('#change_btn');

const inputs = form.querySelectorAll('input[name="lure_btn"]');
inputs.forEach((input) => input.addEventListener('click', selectLure));

change_btn.addEventListener('click', edit_mode_on);

function edit_mode_on() {
  inputs.forEach((el) => {
    el.type = 'text';
    el.setAttribute('list', 'lures');
  });
  this.value = 'Применить';
  this.removeEventListener('click', edit_mode_on);
  this.addEventListener('click', edit_mode_off);
}

function edit_mode_off() {
  inputs.forEach((el) => (el.type = 'button'));
  this.value = 'Изменить';
  this.addEventListener('click', edit_mode_on);
  this.removeEventListener('click', edit_mode_off);
}

function selectLure() {
  lure.value = this.value;
}

form.addEventListener('submit', addFish);

function addFish(e) {
  e.preventDefault();
  const haul = Object.fromEntries(new FormData(this));
  fishpond.push(haul);

  if (!unique_fish.has(haul.fish)) {
    unique_fish.set(haul.fish, true);
    const fish_btn = createFishButton(haul.fish);
    fish_fieldset.appendChild(fish_btn);
  }

  add_to_stat(haul);

  this.reset();
}

//================================================================================================
// Создание кнопки быстрого добавления рыбы

const fish = document.querySelector('#fish');

function selectFish() {
  fish.value = this.value;
}

function createFishButton(text) {
  const button = document.createElement('input');
  button.type = 'button';
  button.textContent = text;
  button.value = text;
  button.addEventListener('click', selectFish);
  return button;
}

//================================================================================================
// Добавление в таблицу

function createRow(haul) {
  const tr = document.createElement('tr');
  tr.append(createCeil(haul.lure), createCeil(haul.fish), createCeil(haul.weight));
  return tr;
}

function createCeil(text) {
  const td = document.createElement('td');
  td.textContent = text;
  return td;
}

function add_to_stat(haul) {
  const lure = stat[haul.lure];
  if (lure) {
    let fish = lure.find((fish) => fish.name === haul.fish);

    if (fish) {
      fish.count += 1;
      fish.sum_weigth += Number(haul.weight);
      fish.avg_weigth = fish.sum_weigth / fish.count;
      fish[getWeightCategory(haul)] += 1;
    } else {
      fish = createFishObj(haul);
      fish[getWeightCategory(haul)] += 1;
      lure.push(fish);
    }
  } else {
    const fish = createFishObj(haul);
    fish[getWeightCategory(haul)] += 1;
    stat[haul.lure] = [fish];
  }
  update_state_table(haul);
}

function getWeightCategory(haul) {
  const { valid, chat, troph, rare_troph } = fish_list.find(
    (fish) => fish.name === haul.fish
  ).weight_category;

  if (valid > haul.weight) {
    return 'no_valid_count';
  }

  if (valid <= haul.weight && haul.weight < chat) {
    return 'valid_count';
  }

  if (chat <= haul.weight && haul.weight < troph) {
    return 'chat_count';
  }

  if (troph <= haul.weight && haul.weight < rare_troph) {
    return 'troph_count';
  }

  if (rare_troph <= haul.weight) {
    return 'rare_troph_count';
  }
}

function createFishObj(haul) {
  return {
    name: haul.fish,
    count: 1,
    sum_weigth: Number(haul.weight),
    avg_weigth: Number(haul.weight),
    no_valid_count: 0,
    valid_count: 0,
    chat_count: 0,
    troph_count: 0,
    rare_troph_count: 0,
  };
}

//====================================================================================
// Выбор приманки для вывода статистики в таблицу

const lure_stat_inputs = document.querySelectorAll('input[name="lure_stat"]');
lure_stat_inputs.forEach((input) => input.addEventListener('change', selectLureStat));

function selectLureStat(e) {
  const lure_stat = stat[this.value];
  const tbody = this.nextElementSibling.querySelector('tbody');
  tbody.innerHTML = '';
  if (lure_stat) {
    lure_stat.forEach((fish) => {
      tbody.appendChild(createStatRow(fish));
    });
  }
}

function createStatRow(fish_stat) {
  const tr = document.createElement('tr');
  let name = createStatCeil(fish_stat.name);
  let count = createStatCeil(fish_stat.count);
  let avg_weigth = createStatCeil(fish_stat.avg_weigth);
  let sum_weigth = createStatCeil(fish_stat.sum_weigth);
  let no_valid_count = createStatCeil(fish_stat.no_valid_count);
  let valid_count = createStatCeil(fish_stat.valid_count);
  let chat_count = createStatCeil(fish_stat.chat_count);
  let troph_count = createStatCeil(fish_stat.troph_count);
  let rare_troph_count = createStatCeil(fish_stat.rare_troph_count);

  tr.append(
    name,
    count,
    avg_weigth,
    sum_weigth,
    no_valid_count,
    valid_count,
    chat_count,
    troph_count,
    rare_troph_count
  );
  return tr;
}

function createStatCeil(text) {
  const td = document.createElement('td');
  td.textContent = text;
  return td;
}

function update_state_table(haul) {
  lure_stat_inputs.forEach((lure) => {
    if (lure.value === haul.lure) {
      const lure_stat = stat[lure.value];
      let tbody = lure.nextElementSibling.children[1];
      tbody.innerHTML = '';
      if (lure_stat) {
        lure_stat.forEach((fish) => {
          tbody.appendChild(createStatRow(fish));
        });
      }
    }
  });
}
