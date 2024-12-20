import React, { Component } from 'react';
import { TdTitle, ProductCard, Linha, DivDetalhe } from '../style';
import { Icon, Collapsible, CollapsibleItem } from 'react-materialize';
import truckExclamation from '../../../../assets/images/truck-exclamation.png';
import { currencyFormat } from '../../../../services/funcoes';
import NumberFormat from 'react-number-format';
import M from 'materialize-css';
import './forced.css';
export default class ConfirmarChegada extends Component {
  state = {
    data: undefined,
  };

  componentDidMount = () => {
    //console.log('ConfirmarChegada');
    //console.log(this.props);
    this.setState({ data: this.props.data });
  };

  confirmarChegada = () => {
    let { data } = this.state;
    data.statusEntrega = 1;
    this.setState({ data });
    this.props.onUpdateItem(data);
  };

  handleUpdateQtdeProduto = (e, produto) => {
    //console.log('produto antes');
    //console.log(produto);
    let valor = e.floatValue;
    if (valor === undefined || valor < 0) {
      valor = 0;
    }
    produto.qtdeEntregue = valor;
    //console.log('produto depois');
    //console.log(produto);
  };

  handleSetStatusItemOK = (item) => {
    const { data } = this.state;
    this.props.onUpdateItemProduto(
      item.qtdeEntregue !== undefined ? item.qtdeEntregue : item.QUANTIDADE,
      data.items[0].CODIGO,
      item.PRODUTO,
      1
    );
  };

  handleSetStatusItemCancel = (item) => {
    const { data } = this.state;
    this.props.onUpdateItemProduto(0, data.items[0].CODIGO, item.PRODUTO, 2);
  };

  cancelarEntrega = () => {
    let { data } = this.state;
    data.statusEntrega = -2;
    this.setState({data });
    this.props.onUpdateItem(data);
    let abrirFinalizar = M.Collapsible.getInstance(
      document.getElementsByClassName('_confirmarFinalizar')[0]
    );

    if (abrirFinalizar !== undefined){
      abrirFinalizar.open();
    }

  };


  render() {
    const { data } = this.state;
    return (
      <Linha className="confirmarChegada" style={{padding: '0px'}}>
        <Collapsible
          accordion={false}
          style={{
            width: '100%',
            borderStyle: 'none',
            boxShadow: 'none',
          }}
        >
          <CollapsibleItem
            // expanded={(data !== undefined && data.statusEntrega === undefined) || (data !== undefined && data.statusEntrega === 0)}
            expanded={false}
            header={
              <>
{/*                 <img
                  src={truckExclamation}
                  alt="Chegada"
                  width={'32px'}
                  height={'32px'}
                /> */}
                <span className="roundNumber">1</span>
                <h4>Chegada</h4>
              </>
            }
            icon={
              <>

               {/*  <li className="material-icons plus">add_circle_outline</li>
                <li className="material-icons minus">remove_circle_outline</li> */}

              </>
            }
            node="div"
          >
            {/* <p>statusEntrega : {data !== undefined && data.statusEntrega}</p> */}
            <Linha style={{ padding: '12px', justifyContent: 'center' }}>
              <DivDetalhe>
                <button
                  className="waves-effect waves-light saib-button is-primary"
                  disabled={(data !== undefined && data.statusEntrega !== undefined && data.statusEntrega !== 0)}
                  onClick={this.confirmarChegada}
                >
                  {data !== undefined && data.statusEntrega === 1 ? 'Confirmada' : 'Confirmar'}
                </button>
              </DivDetalhe>
              <DivDetalhe>
                <button
                  onClick={this.cancelarEntrega}
                  className="waves-effect waves-light saib-button is-secondary"
                  disabled={data !== undefined && (data.statusEntrega === 0 || data.statusEntrega === 3 || data.statusEntrega === -1 || data.statusEntrega === -2 || data.statusEntrega === 2)}
                >
                  Cancelar
                </button>
              </DivDetalhe>
            </Linha>
            {data !== undefined && (
              <>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    flexWrap: 'wrap',
                    justifyContent: 'start',
                    padding: '2px',
                  }}
                >
                  {data !== undefined &&
                    data.items[0] !== undefined &&
                    data.items[0].produtos !== undefined &&
                    data.items[0].produtos.map((item) => (
                      <ProductCard key={Math.floor(Math.random() * 10000)}>
                        <p
                          className="titleCard"
                          style={{
                            // backgroundColor:
                            //   item.statusItem === undefined ||
                            //   item.statusItem === 0
                            //     ? '#8870A4'
                            //     : item.statusItem === 1
                            //     ? '#16a085'
                            //     : item.statusItem === 2 && '#e74c3c',
                            backgroundColor: '#8870A4',
                            color: 'white',
                            fontWeight: '700',
                            textAlign: 'center',
                          }}
                        >
                          {item.PRODUTO + ' - ' + item.DESCRICAO.toLowerCase()}
                        </p>
                        <p>
                          <small>Peso</small> <li>{item.PESO}</li>
                        </p>
                        <p>
                          <small>Qtde</small> <li>{item.QUANTIDADE}</li>
                        </p>
                        <p>
                          <small>Valor</small>{' '}
                          <li>{currencyFormat(item.VALOR)}</li>
                        </p>
                        <p>
{/*                         <p>
                          <small>Entregue</small>{' '}
                          <li>
                            <NumberFormat
                              value={
                                item.qtdeEntregue !== undefined
                                  ? item.qtdeEntregue
                                  : item.QUANTIDADE
                              }
                              onValueChange={(e) => (
                                <>{this.handleUpdateQtdeProduto(e, item)}</>
                              )}
                              thousandSeparator={'.'}
                              decimalSeparator={','}
                              decimalScale={'2'}
                              fixedDecimalScale={'true'}
                            />
                          </li>
                        </p>
                        <div style={{ marginTop: 'auto' }}>
                          <button
                            className="waves-effect waves-light saib-button is-primary"
                            onClick={() => this.handleSetStatusItemOK(item)}
                          >
                            <Icon>done</Icon>Ok
                          </button>
                          <button
                            className="waves-effect waves-light saib-button is-primary"
                            onClick={() => this.handleSetStatusItemCancel(item)}
                          >
                            <Icon>clear</Icon>Cancel
                          </button>
                        </div>
 */}
 </p>
                      </ProductCard>
                    ))}
                </div>
              </>
            )}
          </CollapsibleItem>
        </Collapsible>
      </Linha>
    );
  }
}
