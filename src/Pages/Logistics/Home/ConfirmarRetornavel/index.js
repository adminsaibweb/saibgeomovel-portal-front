import React, { Component } from 'react';
import { Linha, Labels, ProductCard, DivDetalhe } from '../style';
import { Icon, Collapsible, CollapsibleItem } from 'react-materialize';
import vasilhameRetorno from '../../../../assets/images/vasilhame-retorno.png';
import NumberFormat from 'react-number-format';
import './forced.css';
export default class ConfirmarRetornavel extends Component {
  state = {
    data: undefined,
  };

  componentDidMount = () => {
    //console.log('ConfirmarRetornavel');
    //console.log(this.props);
    // let statusEntrega =
    //   this.props.data.statusEntrega !== undefined
    //     ? this.props.data.statusEntrega
    //     : 0;
    this.setState({ data: this.props.data });
  };

  handleUpdateQtdeProdutoEmb1 = (e, produto) => {
    //console.log('produto antes');
    //console.log(produto);
    let valor = e.floatValue;
    if (valor === undefined || valor < 0) {
      valor = 0;
    }
    produto.PROD_EMB_1_QTDE_ENTREGUE = valor;
    //console.log('produto depois');
    //console.log(produto);
  };

  handleUpdateQtdeProdutoEmb2 = (e, produto) => {
    //console.log('produto antes');
    //console.log(produto);
    let valor = e.floatValue;
    if (valor === undefined || valor < 0) {
      valor = 0;
    }
    produto.PROD_EMB_2_QTDE_ENTREGUE = valor;
    //console.log('produto depois');
    //console.log(produto);
  };

  handleSetStatusItemOK = (numeroItem, item) => {
    const { data } = this.state;
    let qtdeDevolvida = 0;

    if (numeroItem === 1){
      qtdeDevolvida = item.PROD_EMB_1_QTDE_ENTREGUE === undefined ?  item.PROD_EMB_1_QUANTIDADE : item.PROD_EMB_1_QTDE_ENTREGUE;
    }
    if (numeroItem === 2){
      qtdeDevolvida = item.PROD_EMB_2_QTDE_ENTREGUE === undefined ?  item.PROD_EMB_2_QUANTIDADE : item.PROD_EMB_2_QTDE_ENTREGUE;
    }

    this.props.onUpdateItemProdutoRetorno(
      numeroItem,
      qtdeDevolvida,
      data.items[0].CODIGO,
      item.PRODUTO,
      1
    );
  };

  handleSetStatusItemCancel = (numeroItem, item) => {
    const { data } = this.state;
    this.props.onUpdateItemProdutoRetorno(
      numeroItem,
      item.qtdeEntregue !== undefined ? item.qtdeEntregue : item.QUANTIDADE,
      data.items[0].CODIGO,
      item.PRODUTO,
      0
    );
  };

  render() {
    const { data } = this.state;
    return (
      <Linha className="confirmarRetornavel" style={{ padding: '0px' }}>
        <Collapsible
          accordion={false}
          className="_confirmarRetornavel"
          style={{
            width: '100%',
            borderStyle: 'none',
            boxShadow: 'none',
          }}
        >
          <CollapsibleItem
            expanded={false}
            header={
              <>
                <span className="roundNumber">2</span>
                <h4>Retorno vasilhame</h4>
              </>
            }
            icon={<></>}
            node="div"
          >
            {data !== undefined && data.statusEntrega !== undefined && (
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
                      <>
                        {((item.PROD_EMB_1_ID !== undefined &&
                          item.PROD_EMB_1_ID != null) ||
                          (item.PROD_EMB_2_ID !== undefined &&
                            item.PROD_EMB_2_ID != null)) && (
                          <ProductCard>
                            {item.PROD_EMB_1_ID != null && (
                              <>
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
                                  {item.PRODUTO +
                                    ' - ' +
                                    item.DESCRICAO.toLowerCase()}
                                </p>
                                <p
                                  style={{
                                    backgroundColor: '#f1f1f1',
                                    color: '#858585',
                                    fontWeight: '700',
                                    justifyContent: 'center',
                                  }}
                                >
                                  Retornável 01
                                </p>
                                <Labels
                                  fontSize="0.8rem"
                                  fontWeight="500"
                                  color="#000000de"
                                >
                                  {item.PROD_EMB_1_ID +
                                    ' - ' +
                                    item.PROD_EMB_1_DESCR.toLowerCase()}
                                </Labels>
                                <p>
                                  <small>Qtde: </small>{' '}
                                  <li>{item.PROD_EMB_1_QUANTIDADE}</li>
                                </p>
                                <p>
                                  <small>Devolvido</small>{' '}
                                  <li>
                                    <NumberFormat
                                      disabled={
                                        item.PROD_EMB_1_QTDE_ENTREGUE_STATUS !==
                                        undefined
                                      }
                                      value={
                                        item.PROD_EMB_1_QTDE_ENTREGUE !==
                                        undefined
                                          ? item.PROD_EMB_1_QTDE_ENTREGUE
                                          : item.PROD_EMB_1_QUANTIDADE
                                      }
                                      onValueChange={(e) => (
                                        <>
                                          {this.handleUpdateQtdeProdutoEmb1(
                                            e,
                                            item
                                          )}
                                        </>
                                      )}
                                      thousandSeparator={'.'}
                                      decimalSeparator={','}
                                      decimalScale={'2'}
                                      fixedDecimalScale={'true'}
                                    />
                                  </li>
                                </p>
                                <div
                                  style={{
                                    marginTop: 'auto',
                                    display:
                                      item.PROD_EMB_1_QTDE_ENTREGUE_STATUS ===
                                      undefined
                                        ? 'flex'
                                        : 'none',
                                  }}
                                >
                                  <button
                                    className="waves-effect waves-light saib-button is-primary"
                                    onClick={() =>
                                      this.handleSetStatusItemOK(1, item)
                                    }
                                    style={{ margin: '0px 2px 0px 2px', minWidth: 'unset' }}
                                  >
                                    Ok
                                  </button>
                                  <button
                                    className="waves-effect waves-light saib-button is-primary"
                                    onClick={() =>
                                      this.handleSetStatusItemCancel(1, item)
                                    }
                                    style={{ margin: '0px 2px 0px 2px', minWidth: 'unset' }}
                                  >
                                    Cancelar
                                  </button>
                                </div>
                              </>
                            )}

                            {item.PROD_EMB_2_ID != null && (
                              <>
                                <p
                                  style={{
                                    backgroundColor: '#f1f1f1',
                                    color: '#858585',
                                    fontWeight: '700',
                                    justifyContent: 'center',
                                  }}
                                >
                                  Retornável 02
                                </p>
                                <Labels
                                  fontSize="0.8rem"
                                  fontWeight="500"
                                  color="#000000de"
                                >
                                  {item.PROD_EMB_2_ID +
                                    ' - ' +
                                    item.PROD_EMB_2_DESCR.toLowerCase()}
                                </Labels>
                                <p>
                                  <small>Qtde: </small>{' '}
                                  <li>{item.PROD_EMB_2_QUANTIDADE}</li>
                                </p>
                                <p>
                                  <small>Devolvido</small>{' '}
                                  <li>
                                    <NumberFormat
                                      disabled={
                                        item.PROD_EMB_2_QTDE_ENTREGUE_STATUS !==
                                        undefined
                                      }
                                      value={
                                        item.PROD_EMB_2_QTDE_ENTREGUE !==
                                        undefined
                                          ? item.PROD_EMB_2_QTDE_ENTREGUE
                                          : item.PROD_EMB_2_QUANTIDADE
                                      }
                                      onValueChange={(e) => (
                                        <>
                                          {this.handleUpdateQtdeProdutoEmb2(
                                            e,
                                            item
                                          )}
                                        </>
                                      )}
                                      thousandSeparator={'.'}
                                      decimalSeparator={','}
                                      decimalScale={'2'}
                                      fixedDecimalScale={'true'}
                                    />
                                  </li>
                                </p>
                                <div
                                  style={{
                                    marginTop: 'auto',
                                    display:
                                      item.PROD_EMB_2_QTDE_ENTREGUE_STATUS ===
                                      undefined
                                        ? 'flex'
                                        : 'none',
                                  }}
                                >
                                  <button
                                    className="waves-effect waves-light saib-button is-primary"
                                    onClick={() =>
                                      this.handleSetStatusItemOK(2, item)
                                    }
                                    style={{ margin: '0px 2px 0px 2px', minWidth: 'unset' }}
                                  >
                                    Ok
                                  </button>
                                  <button
                                    className="waves-effect waves-light saib-button is-primary"
                                    onClick={() =>
                                      this.handleSetStatusItemCancel(2, item)
                                    }
                                    style={{ margin: '0px 2px 0px 2px', minWidth: 'unset' }}
                                  >
                                    Cancelar
                                  </button>
                                </div>
                              </>
                            )}
                          </ProductCard>
                        )}
                      </>
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
