import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { Button, Icon } from 'react-materialize';
import { handleFindProduct } from '../../../tradeGlobalFunctions';
import WaitScreen from '../../../../../../Components/Globals/WaitScreen';
import { getFromStorage } from '../../../../../../services/auth';
import { Labels } from '../../../style';
import { Titulo } from '../style';
import { alerta, formatOracleDateToBr } from '../../../../../../services/funcoes';

class FindProduct extends Component {
  state = {
    status: 0,
    loading: false,
    searchProduct: '',
    products: [],
  };

  componentDidMount = async () => {
    const { cliente, pesquisas, orderDirect } = this.props.history.location.state;
    await this.carregarVariaveisEstado();

    this.setState({
      cliente,
      pesquisas,
      orderDirect,
      loading: false,
    });
  };

  handleSearchProduct = async () => {
    const { searchProduct } = this.state;
    if (!searchProduct) {
      alerta('Informe algum produto', 1);
      return;
    }
    this.setState({ loading: true });
    const sessao = getFromStorage();
    const res = await handleFindProduct(sessao.empresaId, sessao.codigoUsuario, searchProduct);
    if (res) {
      this.setState({ products: res, typeScreen: 1 });
    } else {
      alerta('Não foi possível buscar os dados, verifique sua conexão com a internet', 2);
    }
    this.setState({ loading: false });
  };

  carregarVariaveisEstado = async (e) => {
    const sessao = getFromStorage();

    this.setState({
      empresaAtiva: sessao.empresaId,
      usuarioAtivo: sessao.codigoUsuario,
    });
  };

  render() {
    const { cliente, pesquisas, loading, searchProduct, products, orderDirect } = this.state;

    return (
      <>
        <WaitScreen loading={loading} />

        <Titulo
          style={{
            justifyContent: 'flex-start',
            paddingLeft: '15px',
            top: '0px',
            zIndex: '2',
          }}
        >
          <button
            style={{ cursor: 'pointer', color: 'white' }}
            className="waves-effect waves-light saib-button is-cancel"
            onClick={() => {
              this.props.history.push({
                pathname: '/AdminModule',
                state: {
                  cliente: cliente,
                  pesquisas: pesquisas,
                },
              });
            }}
          >
            <Icon className="modal-close">arrow_back</Icon>
          </button>
          <p style={{ position: 'unset', top: 'unset', width: '100%' }}>Encontrar produto</p>
        </Titulo>
        <section style={{ width: '100%', padding: '10px 5px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', marginTop: '10px', width: '100%' }}>
            <Labels>Buscar produto</Labels>
            <input
              type="text"
              value={searchProduct}
              onChange={(event) => this.setState({ searchProduct: event.target.value })}
              onKeyUp={(event) => {
                if (event.key === 'Enter') {
                  this.handleSearchProduct();
                }
              }}
            />
            <Button
              style={{ width: '100%' }}
              onClick={this.handleSearchProduct}
              className="waves-effect waves-light saib-button is-primary"
            >
              <Icon className="modal-close">search</Icon>
            </Button>
          </div>

          {products.map((prod) => (
            <div
              className="card"
              key={`${prod.PROD_ID}_${prod.LOTE}_${prod.SERIE}`}
              style={{
                fontSize: '16px',
                borderRadius: '5px',
                border: '1px solid #9545ba',
                boxShadow:
                  'rgba(0, 0, 0, 0.25) 0px 2px 2px, rgba(0, 0, 0, 0.12) 0px 0px 3px, rgba(0, 0, 0, 0.12) 0px 2px 2px, rgba(0, 0, 0, 0.17) 0px 4px 3px, rgba(0, 0, 0, 0.09) 0px 0px 2px',
              }}
            >
              <div
                style={{
                  width: '100%',
                  background: '#8E44AD',
                  borderRadius: '5px 5px 0px 0px',
                  padding: '4px',
                }}
              >
                <span style={{ color: '#fff', fontSize: '1.2rem', fontWeight: '700' }}>
                  {prod.NOME_FANTASIA} - {prod.RAZAO_SOCIAL}
                </span>
              </div>
              <p style={{ padding: '0 0.2rem', fontWeight: '700', fontSize: '1rem' }}>
                {prod.CODIGO_INTEGRACAOO} - {prod.PRODUTO}
              </p>
              <p style={{ padding: '0 0.2rem', fontSize: '1rem' }}>
                Endereço: {prod.CIDADE} - {prod.UF} - {prod.ENDERECO} - {prod.LOCALIZACAO}
              </p>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '0.6rem',
                  padding: '0 0.2rem',
                  fontSize: '1rem',
                }}
              >
                <p>
                  <strong>Lote: </strong>
                  {prod.LOTE}
                </p>
                <p>
                  <strong>Série: </strong>
                  {prod.SERIE}
                </p>
              </div>
              <p style={{ padding: '0 0.2rem', fontSize: '1rem' }}>
                <strong>Qtde:</strong> {prod.QTDE - prod.QTDE_UTILIZADA}
              </p>
              {prod.CONTATO && (
                <p style={{ padding: '0 0.2rem', fontSize: '1rem' }}>
                  <strong>Contato:</strong> {prod.CONTATO}
                </p>
              )}
              <p style={{ padding: '0 0.2rem', fontSize: '1rem' }}>
                <strong>Validade:</strong> {formatOracleDateToBr(prod.DATA_VALIDADE)}
              </p>
              {orderDirect && (
                <Button
                  // onClick={() => this.handleSendOrder(prod, index)}
                  style={{
                    gap: '0.3rem',
                    margin: '0.6rem 0.2rem 0.2rem',
                    width: '98%',
                  }}
                  className="waves-effect waves-light saib-button is-primary"
                >
                  <Icon className="modal-close">add</Icon>
                  Adicionar no pedido
                </Button>
              )}
            </div>
          ))}
        </section>
      </>
    );
  }
}

export default withRouter(FindProduct);
