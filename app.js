import React from 'react';
import ReactDOM from 'react-dom';

// Usar somente uma vez este componente
class InpText extends React.Component {
  render() {
    return (
      <div>
        <input type="text" id="inp-text-01" placeholder="Digite o nome de usuário" className="inp-text"/>
        <button className="inp-text-btn" onClick={()=>{APIprocess(document.getElementById("inp-text-01").value); this.props.jsonAtl();}}>Ok</button>
      </div>
    );
  }
}

class Cards extends React.Component {
  render() {
    let itens = this.props.json.map((item, index) => {
      return (
        <div className="card" key={index}>
          <img src={item.avatar_url}/>
          <h2>{item.name}</h2>
          <p className="card-fol"><b>{item.followers}</b> followers</p>
          <p className="card-position"><b>#{item.pos}</b></p>
        </div>
      );
    });
    return (
      <div>
        {itens}
      </div>
    );
  }
}

class Main extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      json: GH_DATA
    };
  }

  render() {
    return (
      <div>
        <InpText jsonAtl={()=>{this.setState({json: GH_DATA});}}/>
        <Cards json={this.state.json}/>
      </div>
    )
  }
}


let xhttp = new XMLHttpRequest();

let GH_DATA, GH_MAIN_POS;

/// API GITHUB - Execução
function APIprocess(user) {

  GH_DATA = []
  GH_MAIN_POS = 0;

  let GH_MAIN = user;
  let tmpGH_DATA = [];

  xhttp.open("GET", `https://api.github.com/users/${GH_MAIN}`, false);
  xhttp.send();

  let GH_USER = JSON.parse(xhttp.responseText);
  let GH_FLWG = JSON.parse(xhttp.responseText).following;

  if (parseInt(GH_FLWG) <= 30) {
    let GH_USERS = [GH_MAIN];

    // Pega os usuários das contas que são seguidas pel principal
    xhttp.open("GET", `https://api.github.com/users/${GH_MAIN}/following`, false);
    xhttp.send();
    let GH_FLWG_DATA = JSON.parse(xhttp.responseText);
    for (let i = 0; i < parseInt(GH_FLWG); i++) {
      GH_USERS.push(GH_FLWG_DATA[i].login);
    }

    // Pega os dados das contas
    for (let i = 0; i < GH_USERS.length; i++) {
      xhttp.open("GET", `https://api.github.com/users/${GH_USERS[i]}`, false);
      xhttp.send();
      GH_DATA.push(JSON.parse(xhttp.responseText));
    }

    // Ordena do que tem mais seguidores para o que tem menos
    GH_DATA.sort(function(a, b) {
      if (a.followers > b.followers) return -1;
      if (a.followers < b.followers) return 1;
      return 0;
    });

    // Pega a posição do usuário principal
    for (let i = 0; i < GH_DATA.length; i++) {
      if (GH_DATA[i].login == GH_MAIN) {
        GH_MAIN_POS = i;
      }
    }

    // Inseri o usuário principal caso ele esteja em uma posição acima da 10º
    for (let i = 0; i < 10; i++) {
      if (GH_MAIN_POS > 9 && i == 9) {
        tmpGH_DATA.push(GH_USER);
        tmpGH_DATA[i].pos = GH_MAIN_POS + 1;
      } else {
        tmpGH_DATA.push(GH_DATA[i]);
        tmpGH_DATA[i].pos = i + 1;
      }
    }
    GH_DATA = tmpGH_DATA;
  } else if(GH_FLWG > 29) {
    alert("A quantidade de pessoas eu você Segue é muito Alta. O máximo permitido é 30 pessoas.")
  } else {
    alert("Foi atingido o limite de requisições com a API do GitHub. Em uma Hora voltará à funcionar!");
  }
} APIprocess("GabrielDSRodrigues");


ReactDOM.render(
  <Main json={GH_DATA}></Main>,
  document.getElementById('react-app')
);