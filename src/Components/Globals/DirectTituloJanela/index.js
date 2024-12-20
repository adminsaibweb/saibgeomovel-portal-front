import React, { Component } from 'react';
import { Link, withRouter } from 'react-router-dom';
import './style.css';

class DirectTituloJanela extends Component {
  state = {
    classNameBase: 'directTituloJanela',
  };
  componentDidMount = () => {
    if (this.props.classNameTitulo !== undefined) {
      let { classNameBase } = this.state;
      classNameBase += ' ' + this.props.classNameTitulo;
      this.setState({ classNameBase });
      // //console.log('this.props');
      // //console.log(this.props);
    }
  };
  render() {
    const { classNameBase } = this.state;
    return (
      <div className={classNameBase}>
        <div className="divTitulo">
          <>
            {this.props.urlVoltar === undefined ? (
              <Link
                className="iconeVoltar"
                to={{
                  pathname: this.props.stateUrl,
                  state: this.props.state,
                }}
              >
                <i className="material-icons">arrow_back_ios</i>
              </Link>
            ) : (
              <>
                {/* eslint-disable-next-line */}
                <a href={this.props.urlVoltar} className="iconeVoltar">
                  <i className="material-icons">arrow_back_ios</i>
                </a>
              </>
            )}
          </>
          <h5 className="h5Titulo">
            {this.props.titulo !== undefined && this.props.titulo}
          </h5>
          {this.props.urlNovo !== undefined && (
            <div className="divDireita">
              <Link
                className="waves-effect waves-light saib-button-titulo-janela is-call-to-action iconeNovo"
                to={{ pathname: this.props.urlNovo, state: { action: 'novo' } }}
              >
                <i className="material-icons">
                  {this.props.iconeNovo !== undefined
                    ? this.props.iconeNovo
                    : 'add'}
                </i>
                {this.props.textoIconeNovo !== undefined
                  ? this.props.textoIconeNovo
                  : 'Criar'}
              </Link>
            </div>
          )}
        </div>
      </div>
    );
  }
}

export default withRouter(DirectTituloJanela);
