import React, { Component } from 'react';
import { Titulo, Linha, DivDetalhe, Labels } from '../style';
import { Icon, Collapsible, CollapsibleItem } from 'react-materialize';
import acerto from '../../../../assets/images/acerto.png';
import NumberFormat from 'react-number-format';
import { alerta, currencyFormat } from '../../../../services/funcoes';
import './forced.css';

export default class ConfirmarAcerto extends Component {
  state = {
    statusEntrega: undefined,
    data: undefined,
    valorDigitado: 0,
    formaPagamento: '0',
  };

  componentDidMount = () => {
    //console.log('********** ConfirmarAcerto ************ ');
    //console.log(this.props);
    let statusEntrega =
      this.props.data.statusEntrega !== undefined
        ? this.props.data.statusEntrega
        : 0;
    this.setState({ statusEntrega, data: this.props.data });
    //console.log('statusEntrega');
    //console.log(statusEntrega);
  };

  handleUpdateValorDigitado = (e) => {
    let { valorDigitado } = this.state;
    valorDigitado = e.floatValue;
    if (valorDigitado === undefined) {
      valorDigitado = 0;
    }
    this.setState({ valorDigitado });
  };

  handleChangeFormaPagamento = (e) => {
    let { formaPagamento } = this.state;
    formaPagamento = e.target.value;
    this.setState({ formaPagamento });
  };

  handleAddFormaPagamento = () => {
    //console.log('handleAddFormaPagamento');
    let { valorDigitado, formaPagamento, data } = this.state;
    if (valorDigitado === 0) {
      alerta('Digite um valor par acontinuar', 1);
      return;
    }

    if (
      data.items[0].VALOR <
      (data.valorAcertado === undefined
        ? 0
        : data.valorAcertado + valorDigitado)
    ) {
      alerta('Valor digitado maior que o pendente.', 1);
      return;
    }

    if (
      data.pagamentos !== undefined &&
      data.pagamentos.find((pgto) => pgto.formaPagamento === formaPagamento)
    ) {
      alerta('Selecione outra forma de pagamento.', 1);
      return;
    }

    this.props.handleAppFormaPagamento(
      valorDigitado,
      formaPagamento,
      data.CODIGO
    );
    valorDigitado = 0;
    formaPagamento = '0';
    this.setState({ valorDigitado, formaPagamento });
  };

  handleDeleteFormaPagamento = (idPagamento) => {
    //console.log('handleDeleteFormaPagamento');
    let { data } = this.state;
    this.props.handleDeleteFormaPagamento(idPagamento, data.CODIGO);
  };

  handleAddPagamentoRestante = () => {
    let { valorDigitado, data } = this.state;
    let valorPedido = Number(data.items[0].VALOR).toFixed(2);
    let valorAcertado =
      data.valorAcertado === undefined
        ? 0
        : Number(data.valorAcertado).toFixed(2);
    valorDigitado = (valorPedido - valorAcertado).toFixed(2);

    if (valorDigitado < 0) {
      valorDigitado = 0;
    }

    this.setState({ valorDigitado: valorDigitado.replace('.', ',') });
  };

  render() {
    const { data, formaPagamento, valorDigitado } = this.state;
    return (
      <>
        <Linha className="confirmarAcerto">
          <Collapsible
            className={'_confirmarAcertos'}
            accordion={false}
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
                  <span className="roundNumber">
                    {data !== undefined &&
                    data.items[0].produtos.find(
                      (_prod) =>
                        _prod.PROD_EMB_1_ID !== null ||
                        _prod.PROD_EMB_2_ID !== null
                    ) !== undefined
                      ? 3
                      : 2}
                  </span>
                  {/* <img src={acerto} alt="Acerto" width={'32px'} height={'32px'} /> */}
                  <h4>Acerto</h4>
                </>
              }
              icon={
                <>
                  {/*                 <li className="material-icons plus">add_circle_outline</li>
                <li className="material-icons minus">remove_circle_outline</li>
 */}
                </>
              }
              node="div"
            >
              {/* {data !== undefined && (
                <p>statusEntrega : {data.statusEntrega === undefined ? 'data undefined' : data.statusEntrega}</p>
              )} */}

              {data !== undefined && data.statusEntrega !== undefined && (
                <Linha
                  style={{
                    padding: '0px',
                    borderRadius: '4px',
                    boxShadow: 'rgba(0, 0, 0, 0.1) -1px 1px 5px 1px',
                  }}
                >
                  <Linha
                    style={{
                      justifyContent: 'space-around',
                      marginTop: '15px',
                    }}
                  >
                    <DivDetalhe>
                      <Labels fontSize="1.0rem" fontWeight="700">
                        Aberto
                      </Labels>
                      <Labels
                        fontSize="1.1rem"
                        fontWeight="500"
                        style={{ paddingTop: '5px' }}
                      >
                        {data !== undefined &&
                          currencyFormat(data.items[0].VALOR)}
                      </Labels>
                    </DivDetalhe>
                    <DivDetalhe>
                      <Labels
                        fontSize="1.0rem"
                        fontWeight="700"
                        color={
                          data !== undefined &&
                          data.valorAcertado !== undefined &&
                          Number(data.valorAcertado) ===
                            Number(data.items[0].VALOR)
                            ? 'blue'
                            : 'red'
                        }
                      >
                        Acertado
                      </Labels>
                      <Labels
                        fontSize="1.1rem"
                        fontWeight="500"
                        color={
                          data !== undefined &&
                          data.valorAcertado !== undefined &&
                          Number(data.valorAcertado) ===
                            Number(data.items[0].VALOR)
                            ? 'blue'
                            : 'red'
                        }
                        style={{ paddingTop: '5px' }}
                      >
                        {data !== undefined && data.valorAcertado !== undefined
                          ? currencyFormat(data.valorAcertado)
                          : currencyFormat(0)}
                      </Labels>
                    </DivDetalhe>
                  </Linha>
                  <Linha
                    style={{
                      marginTop: '15px',
                      padding: '0px',
                      justifyContent: 'space-evenly',
                      borderBottom: '1px solid #ccc',
                    }}
                  >
                    <DivDetalhe style={{ padding: '4px' }}>
                      <Labels
                        fontSize="1rem"
                        fontWeight="500"
                        style={{ paddingTop: '5px' }}
                      >
                        Recebimento
                      </Labels>
                      <select
                        name="formaPagamento"
                        id="formaPagamento"
                        value={formaPagamento}
                        style={{ display: 'flex' }}
                        onChange={this.handleChangeFormaPagamento}
                      >
                        <option value="0">Dinheiro</option>
                        <option value="1">Cheque</option>
                        <option value="2">Boleto</option>
                        <option value="3">PIX</option>
                        <option value="4">CCR</option>
                        <option value="5">CCB</option>
                      </select>
                    </DivDetalhe>
                    <DivDetalhe style={{ padding: '4px', width: '45%' }}>
                      <Labels
                        fontSize="1rem"
                        fontWeight="500"
                        style={{ paddingTop: '5px' }}
                      >
                        Valor
                      </Labels>
                      <NumberFormat
                        value={valorDigitado}
                        onValueChange={(e) => {
                          this.handleUpdateValorDigitado(e);
                        }}
                        thousandSeparator={'.'}
                        decimalSeparator={','}
                        decimalScale={'2'}
                        fixedDecimalScale={'true'}
                      />
                    </DivDetalhe>
                    <DivDetalhe
                      style={{
                        padding: '4px',
                        justifyContent: 'space-around',
                        display:
                          data !== undefined && data.statusEntrega !== 3
                            ? 'flex'
                            : 'none',
                      }}
                    >
                      <button
                        className="waves-effect waves-light saib-button is-primary adicionarAcerto"
                        style={{
                          color: 'white',
                          minWidth: 'unset',
                          width: 'fit-content',
                        }}
                        onClick={this.handleAddFormaPagamento}
                      >
                        <Icon>add</Icon>
                      </button>
                      <button
                        className="waves-effect waves-light saib-button is-call-to-action adicionarAcerto"
                        style={{
                          color: 'white',
                          minWidth: 'unset',
                          width: 'fit-content',
                        }}
                        onClick={this.handleAddPagamentoRestante}
                      >
                        <Icon>done_all</Icon>
                      </button>
                    </DivDetalhe>
                  </Linha>
                  {data !== undefined && data.pagamentos !== undefined && (
                    <>
                      {data.pagamentos.map((pgto) => (
                        <Linha
                          key={Number(pgto.id)}
                          style={{
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            minHeight: '25px',
                          }}
                        >
                          <DivDetalhe
                            style={{ width: '33%', paddingBottom: '0px' }}
                          >
                            <Labels fontSize={'0.9rem'} fontWeight="500">
                              {pgto.formaPagamento === '0'
                                ? 'Dinheiro'
                                : pgto.formaPagamento === '1'
                                ? 'Cheque'
                                : pgto.formaPagamento === '2'
                                ? 'Boleto'
                                : pgto.formaPagamento === '3'
                                ? 'PIX'
                                : pgto.formaPagamento === '4'
                                ? 'CCR'
                                : pgto.formaPagamento === '5' && 'CCB'}
                            </Labels>
                          </DivDetalhe>
                          <DivDetalhe
                            style={{ width: '33%', paddingBottom: '0px' }}
                          >
                            <Labels fontSize={'0.9rem'} fontWeight="500">
                              {currencyFormat(pgto.valor)}
                            </Labels>
                          </DivDetalhe>
                          <DivDetalhe
                            style={{
                              width: '15%',
                              paddingBottom: '0px',
                              padding: '4px',
                              justifyContent: 'center',
                              display:
                                data !== undefined && data.statusEntrega !== 3
                                  ? 'flex'
                                  : 'none',
                            }}
                          >
                            <button
                              className="waves-effect waves-light saib-button is-primary removerAcerto"
                              style={{
                                color: 'white',
                                minWidth: 'unset',
                                width: 'fit-content',
                              }}
                              onClick={() =>
                                this.handleDeleteFormaPagamento(pgto.id)
                              }
                            >
                              <Icon>remove</Icon>
                            </button>
                          </DivDetalhe>
                        </Linha>
                      ))}
                    </>
                  )}
                </Linha>
              )}

              <p>
                {/*               <Linha style={{ padding: '5px' }}>
                {data !== undefined &&
                  data.items[0] !== undefined &&
                  data.items[0].produtos !== undefined &&
                  data.items[0].produtos.map((item) => (
                    <DivDetalhe
                      style={{
                        maxWidth: '140px',
                        paddingLeft: '0px',
                        paddingRight: '0px',
                        paddingBottom: '0px',
                        margin: '2px',
                        boxShadow: 'rgba(0, 0, 0, 0.1) -1px 1px 5px 1px',
                      }}
                    >
                      <Linha
                        style={{
                          backgroundColor:
                            item.statusItem === undefined ||
                            item.statusItem === 0
                              ? '#8870A4'
                              : item.statusItem === 1
                              ? '#16a085'
                              : item.statusItem === 2 && '#e74c3c',
                          color: '#fff',
                          paddingLeft: '0px',
                          paddingRight: '0px',
                        }}
                      >
                        <Labels
                          fontSize={'0.9rem'}
                          fontWeight={700}
                          color="white"
                          style={{
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {item.PRODUTO + ' - ' + item.DESCRICAO.toLowerCase()}
                        </Labels>
                      </Linha>
                      <Linha
                        style={{
                          justifyContent: 'space-between',
                          paddingRight: '0px',
                          paddingLeft: '0px',
                          borderBottom:
                            Number(item.QUANTIDADE) !==
                            Number(item.qtdeEntregue)
                              ? '2px solid red'
                              : '0px',
                        }}
                      >
                        <DivDetalhe>
                          <Labels fontSize={'0.9rem'} fontWeight={500}>
                            Qtde
                          </Labels>
                          <Labels fontSize={'0.9rem'} fontWeight={500}>
                            {item.QUANTIDADE}
                          </Labels>
                        </DivDetalhe>
                        <DivDetalhe>
                          <Labels fontSize={'0.9rem'} fontWeight={500}>
                            Entregue
                          </Labels>
                          <Labels fontSize={'0.9rem'} fontWeight={500}>
                            {item.qtdeEntregue}
                          </Labels>
                        </DivDetalhe>
                      </Linha>
                    </DivDetalhe>
                  ))}
              </Linha>
 */}
              </p>
            </CollapsibleItem>
          </Collapsible>
        </Linha>
      </>
    );
  }
}
