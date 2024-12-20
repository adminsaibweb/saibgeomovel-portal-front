import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
  ProductCard,
  TdTitle,
  Titulo,
  Labels,
} from '../style';
import { Icon, Collapsible, CollapsibleItem } from 'react-materialize';
import './forced.css';
import { currencyFormat } from '../../../../services/funcoes';

class LogisticsMaisDetalhes extends Component {
  state = {
    data:
      this.props.reducer[0] !== undefined ? this.props.reducer[0].itemSelecionado : undefined,
  };

  componentDidMount = () => {
    const {data} = this.state;
    if (data === undefined){
      this.props.history.goBack();
    }
    // this.setState({ data: this.props.data });
  };

  render() {
    let { data } = this.state;
    return (
      <>
        <Titulo
          style={{
            justifyContent: 'flex-start',
            paddingLeft: '15px',
            top: '0px',
          }}
        >
          <button
            style={{ cursor: 'pointer', color: 'white' }}
            onClick={() => this.props.history.goBack()}
            className="waves-effect waves-light saib-button is-cancel"
          >
            <Icon className="modal-close">arrow_back</Icon>
          </button>
          <p style={{ position: 'unset', top: 'unset', width: '100%' }}>
            Detalhes da entrega
          </p>
        </Titulo>
        <Collapsible
          className="maisDetalhes"
          accordion={false}
          style={{
            width: '100%',
            borderStyle: 'none',
            boxShadow: 'none',
          }}
        >
          <CollapsibleItem
            expanded={true}
            header="Dados da venda"
            icon={<Icon>shopping_cart</Icon>}
            node="div"
          >
            {data !== undefined && (
              <table className="DataComponent" style={{ fontSize: '0.9rem' }}>
                <tbody>
                  <tr>
                    <TdTitle>Número pedido</TdTitle>
                    <td
                      style={{
                        paddingTop: '0px',
                        paddingBottom: '2px',
                        textAlign: 'left',
                        width: '100%',
                      }}
                    >
                      {data.CODIGO_ENTREGA}
                    </td>
                  </tr>
                  <tr>
                    <TdTitle>Cliente</TdTitle>
                    <td
                      style={{
                        paddingTop: '0px',
                        paddingBottom: '2px',
                        textAlign: 'left',
                        width: '100%',
                        textTransform: 'capitalize',
                      }}
                    >
                      {data.FANTASIA.toLowerCase()}
                    </td>
                  </tr>
                  <tr>
                    <TdTitle>Cpf/CNPJ</TdTitle>
                    <td
                      style={{
                        paddingTop: '0px',
                        paddingBottom: '2px',
                        textAlign: 'left',
                        width: '100%',
                        textTransform: 'capitalize',
                      }}
                    >
                      {data.CNPJ_CPF}
                    </td>
                  </tr>
                  <tr>
                    <TdTitle>Endereço</TdTitle>
                    <td
                      style={{
                        paddingTop: '0px',
                        paddingBottom: '2px',
                        textAlign: 'left',
                        width: '100%',
                        textTransform: 'capitalize',
                      }}
                    >
                      {data.ENDERECO +
                        ',' +
                        data.BAIRRO +
                        ', ' +
                        data.CIDADE +
                        '/' +
                        data.UF +
                        ' Cep: ' +
                        data.CEP}
                    </td>
                  </tr>
                  <tr>
                    <TdTitle>Telefone</TdTitle>
                    <td
                      style={{
                        paddingTop: '0px',
                        paddingBottom: '2px',
                        textAlign: 'left',
                        width: '100%',
                      }}
                    >
                      {data.TELEFONE}
                    </td>
                  </tr>
                  <tr>
                    <TdTitle>Entregue</TdTitle>
                    <td
                      style={{
                        paddingTop: '0px',
                        paddingBottom: '2px',
                        textAlign: 'left',
                        width: '100%',
                        textTransform: 'capitalize',
                      }}
                    >
                      {data.ENTREGUE == null ? 'Não' : 'Sim'}
                    </td>
                  </tr>
                  <tr>
                    <TdTitle>Complemento/Observação</TdTitle>
                    <td
                      style={{
                        paddingTop: '0px',
                        paddingBottom: '2px',
                        textAlign: 'left',
                        width: '100%',
                      }}
                    >
                      {data.INSTRUCOES !== 'null'
                        ? data.INSTRUCOES
                        : ' ' + data.COMPLEMENTO !== 'null'
                        ? data.COMPLEMENTO
                        : ''}
                    </td>
                  </tr>
                </tbody>
              </table>
            )}
          </CollapsibleItem>
        </Collapsible>
        <Collapsible
          accordion={false}
          style={{
            width: '100%',
            borderStyle: 'none',
            boxShadow: 'none',
          }}
        >
          <CollapsibleItem
            expanded={true}
            header="Produtos da venda"
            icon={<Icon>shopping_basket</Icon>}
            node="div"
          >
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
                      <small>Valor</small> <li>{currencyFormat(item.VALOR)}</li>
                    </p>
                    {((item.PROD_EMB_1_ID !== undefined &&
                      item.PROD_EMB_1_ID != null) ||
                      (item.PROD_EMB_2_ID !== undefined &&
                        item.PROD_EMB_2_ID != null)) && (
                      <>
                        {item.PROD_EMB_1_ID != null && (
                          <>
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
                          </>
                        )}
                      </>
                    )}
                  </ProductCard>
                ))}
            </div>
          </CollapsibleItem>
        </Collapsible>
      </>
    );
  }
}
// export default ProdutosImagens;
export default connect((state) => ({ reducer: state.logistics }))(
  LogisticsMaisDetalhes
);
