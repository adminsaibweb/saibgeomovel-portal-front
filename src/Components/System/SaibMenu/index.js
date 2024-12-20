import React, { Component } from 'react';
import {
  TelaEscuraFundo,
  IconeSaib,
  MenuSaib,
  MenuItemModulo,
  MenuItemSubModulo,
  MenuSubItem,
  LeftPanel,
} from './styles.js';
import imgLogo from '../../../assets/images/saiblogo.png';
import './forced.css';
import {version} from '../../../../package.json'

function getTamanhoMinino() {
  if (window.innerWidth <= 699) {
    return 1;
  } else {
    return 64;
  }
}

function getTamanhoMaximo() {
  return 300;
}

export default class SaibMenu extends Component {
  state = {
    tamanhoMenu: getTamanhoMinino(),
    itensExpandir: -1,
  };

  componentDidMount = () =>{
    // //console.log('this.props');
    // //console.log(this.props);
  }

  alterarTamanhoMenu = () => {
    let { tamanhoMenu } = this.state;
    if (tamanhoMenu <= getTamanhoMinino()) {
      tamanhoMenu = getTamanhoMaximo();
    } else {
      tamanhoMenu = getTamanhoMinino();
    }
    // //console.log('alterarTamanhoMenu =>' + tamanhoMenu);
    this.setState({ tamanhoMenu });
  };

  menuResumido = () => {
    //console.log('menuResumido');
    let { tamanhoMenu, itensExpandir } = this.state;
    itensExpandir = -1;
    tamanhoMenu = getTamanhoMinino();
    this.setState({ tamanhoMenu, itensExpandir });
  };

  menuCompleto = () => {
    let { tamanhoMenu } = this.state;
    tamanhoMenu = getTamanhoMaximo();
    // //console.log('menuCompleto =>' + tamanhoMenu);
    this.setState({ tamanhoMenu });
  };

  handleExpandir = (menu) => {
    let { itensExpandir } = this.state;
    itensExpandir = itensExpandir !== menu.GME_ID ? menu.GME_ID : -1;
    this.setState({ itensExpandir });
  };

  handleClickMenuPai = (menu) => {
    // //console.log(menu);
    if (menu.GME_URL !== '' && menu.GME_URL != null) {
      window.location.href = menu.GME_URL;
    }
  };

  handleClickSubMenuPai = (menu) =>{
    let {tamanhoMenu} = this.state;

    if (tamanhoMenu === getTamanhoMaximo()) {
      this.handleExpandir(menu);
      this.handleClickMenuPai(menu);
    } else {
      this.alterarTamanhoMenu();
    }
  }

  render() {
    const { tamanhoMenu, itensExpandir } = this.state;
    return (
      <>
        <TelaEscuraFundo
          largura={tamanhoMenu}
          // onMouseOver={this.menuResumido}
          onClick={this.menuResumido}
        />
        <LeftPanel
          className="leftPanel"
          largura={tamanhoMenu}
          style={{
            width:
              getTamanhoMinino() === 1 ? window.innerWidth : getTamanhoMinino(),
          }}
        >
          <IconeSaib
            largura={tamanhoMenu}
            style={{
              width:
                getTamanhoMinino() === 1
                  ? window.innerWidth
                  : getTamanhoMinino(),
            }}
          >
            <div className="iconeSaib">
              <img
                src={imgLogo}
                alt="Logo Saib"
                onError={(e)=>{e.target.onerror = null; e.target.style.display="none"}}
                onClick={this.alterarTamanhoMenu}
                // onMouseOver={this.menuCompleto}
              />
            </div>
            <div className="dadosUsuarios" style={{ justifyContent: 'center' }}>
              <span
                style={{
                  // lineHeight: '15px',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {this.props.session !== undefined &&
                  this.props.session.nomeUsuario}
              </span>
              <span
                style={{
                  // lineHeight: '15px',
                  fontWeight: '900',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {this.props.session !== undefined &&
                  this.props.session.empresaNomeFantasia}
              </span>
            </div>
          </IconeSaib>
          <MenuSaib largura={tamanhoMenu}>
            {this.props.paths !== undefined && this.props.paths.length > 0 ? (
              this.props.paths.map(
                (menu) =>
                  menu.GME_ICON === '-' ? (
                    <MenuItemModulo
                      // onMouseOver={this.menuCompleto}
                      key={menu.GME_ID}
                      largura={tamanhoMenu}
                      menuProps={menu}
                      onClick={() => {
                        if (tamanhoMenu === getTamanhoMaximo()) {
                          this.handleExpandir(menu);
                          this.handleClickMenuPai(menu);
                        } else {
                          this.alterarTamanhoMenu();
                        }
                      }}
                    >
                      <span className="menuItemPai">
                        <div className="iconeMenuItem">
                          <img
                            src={
                              menu.GME_IMAGE === '' || menu.GME_IMAGE === null
                                ? imgLogo
                                : menu.GME_IMAGE
                            }
                            alt={menu.GME_DESCRICAO}
                            width="32px"
                            onError={(e)=>{e.target.onerror = null; e.target.style.display="none"}}
                            />
                        </div>
                        <div className="botaoMenuItem">
                          <span>{menu.GME_DESCRICAO}</span>
                        </div>
                      </span>
                    </MenuItemModulo>
                  ) : menu.GME_ICON === '+' || menu.GME_ICON === '+P' ? (
                    <MenuItemSubModulo
                      // onMouseOver={this.menuCompleto}
                      key={menu.GME_ID}
                      largura={tamanhoMenu}
                      itensExpandir={itensExpandir}
                      menuProps={menu}
                      onClick={()=>this.handleClickSubMenuPai(menu)}
                    >
                      <span className="subMenuItemPai">
                        <div className="iconeMenuItem">
                          <img
                            src={
                              menu.GME_IMAGE === '' || menu.GME_IMAGE === null
                                ? imgLogo
                                : menu.GME_IMAGE
                            }
                            alt={menu.GME_DESCRICAO}
                            width="32px"
                            onError={(e)=>{e.target.onerror = null; e.target.style.display="none"}}
                            />
                        </div>
                        <div className="botaoMenuItem">
                          <span>{menu.GME_DESCRICAO}</span>
                        </div>
                      </span>
                    </MenuItemSubModulo>

                  ): menu.GME_PERMISSAO !== 1 && (
                    <MenuSubItem
                      key={menu.GME_ID}
                      itensExpandir={itensExpandir}
                      largura={tamanhoMenu}
                      menuProps={menu}
                      onClick={() => this.handleClickMenuPai(menu)}
                    >
                      <div className="botaoMenuItem">
                        <span>{menu.GME_DESCRICAO}</span>
                      </div>
                    </MenuSubItem>
                  )
              )
            ) : (
              <MenuItemModulo>
                <h6>Carregando...</h6>
              </MenuItemModulo>
            )}
            <div style={{ display: tamanhoMenu >= 300 ? "block" : "none" ,position: "fixed" , marginTop: '1rem', width: '100%', bottom: "2px", left: "12px" }}>
              <span style={{ fontSize: '0.8rem', color: "#4d4d4d" }}>{version}</span>
            </div>
          </MenuSaib>
        </LeftPanel>
      </>
    );
  }

}
