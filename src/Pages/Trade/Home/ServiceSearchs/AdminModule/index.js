import React, { Component } from 'react';
import { Titulo, TradeTitle } from '../../style';
import { Link, withRouter } from 'react-router-dom';
import { Icon } from 'react-materialize';
import { capitalize } from '../../../../../services/funcoes';
import { AiOutlineFileSearch } from 'react-icons/ai';
import { MenuItem } from './style';
import { FaBoxes } from 'react-icons/fa';
import { MdAttachMoney } from 'react-icons/md';
import { FaRegFileAlt, FaSearch } from 'react-icons/fa';
import { IoIosBriefcase, IoIosFolderOpen } from "react-icons/io";

// import { IoMdPersonAdd } from 'react-icons/io';
class AdminModule extends Component {
  state = {
    cliente: undefined,
    pesquisas: undefined,
  };

  componentDidMount = async () => {
    let { cliente, pesquisas } = this.state;

    cliente = this.props.history.location.state.cliente;
    pesquisas = this.props.history.location.state.pesquisas;

    this.setState({
      cliente,
      pesquisas,
    });
  };
  render() {
    const { cliente, pesquisas } = this.state;
    return (
      <>
        <Titulo
          style={{
            justifyContent: 'flex-start',
            paddingLeft: '15px',
            top: '0px',
            zIndex: '2',
          }}
        >
          <Link
            className="backToStartWorkDay"
            to={{
              pathname: '/ServiceSearchs',
              state: {
                cliente: cliente,
                pesquisas: pesquisas,
              },
            }}
          >
            <button
              style={{ cursor: 'pointer', color: 'white' }}
              className="waves-effect waves-light saib-button is-cancel"
            >
              <Icon className="modal-close">arrow_back</Icon>
            </button>
          </Link>
          <p style={{ position: 'unset', top: 'unset', width: '100%' }}>Admin</p>
        </Titulo>
        <div style={{ marginTop: '60px' }}>
          <div style={{ width: '100%' }}>
            {cliente && (
              <TradeTitle style={{ marginBottom: '20px' }}>
                {capitalize(cliente.CLI_NOME_FANTASIA.toLowerCase())}
              </TradeTitle>
            )}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', width: '100%', marginTop: '30px' }}>
            <Link
              to={{
                pathname: '/Conference',
                state: {
                  cliente: cliente,
                  pesquisas: pesquisas,
                },
              }}
            >
              <MenuItem>
                <AiOutlineFileSearch size={32} />
                <p style={{ fontSize: '26px', fontWeight: 700 }}>Conferência de estoque</p>
              </MenuItem>
            </Link>
            <Link
              className="backToStartWorkDay"
              to={{
                pathname: '/InventoryModule',
                state: {
                  cliente: cliente,
                  pesquisas: pesquisas,
                },
              }}
            >
              <MenuItem>
                <FaBoxes size={32} />
                <p style={{ fontSize: '26px', fontWeight: 700 }}>Inventário</p>
              </MenuItem>
            </Link>
            <Link
              className="backToStartWorkDay"
              to={{
                pathname: '/FinancialModule',
                state: {
                  cliente: cliente,
                  pesquisas: pesquisas,
                },
              }}
            >
              <MenuItem>
                <div style={{ border: '3px solid #8E44AD', height: '45px', borderRadius: '2px' }}>
                  <MdAttachMoney size={32} />
                </div>
                <p style={{ fontSize: '26px', fontWeight: 700 }}>Financeiro</p>
              </MenuItem>
            </Link>
            <Link
              className="backToStartWorkDay"
              to={{
                pathname: '/Order',
                state: {
                  cliente: cliente,
                  pesquisas: pesquisas,
                },
              }}
            >
              <MenuItem>
                <FaRegFileAlt size={32} color="#8E44AD" />
                <p style={{ fontSize: '26px', fontWeight: 700 }}>Venda consignado</p>
              </MenuItem>
            </Link>
            <Link
              className="backToStartWorkDay"
              to={{
                pathname: '/OrderDirect',
                state: {
                  cliente: cliente,
                  pesquisas: pesquisas,
                },
              }}
            >
              <MenuItem style={{ borderBottom: '2px solid #D9D9D9' }}>
                <IoIosBriefcase size={32} />
                <p style={{ fontSize: '26px', fontWeight: 700 }}>Venda direta</p>
              </MenuItem>
            </Link>
            <Link
              className="backToStartWorkDay"
              to={{
                pathname: '/HistoricOrders',
                state: {
                  cliente: cliente,
                  pesquisas: pesquisas,
                },
              }}
            >
              <MenuItem style={{ borderBottom: '2px solid #D9D9D9' }}>
                <IoIosFolderOpen size={32} />
                <p style={{ fontSize: '26px', fontWeight: 700 }}>Histórico de pedidos</p>
              </MenuItem>
            </Link>
            <Link
              className="backToStartWorkDay"
              to={{
                pathname: '/FindProduct',
                state: {
                  cliente: cliente,
                  pesquisas: pesquisas,
                },
              }}
            >
              <MenuItem style={{ borderBottom: '2px solid #D9D9D9' }}>
                <FaSearch size={32} />
                <p style={{ fontSize: '26px', fontWeight: 700 }}>Encontrar produto</p>
              </MenuItem>
            </Link>
            {/* <MenuItem style={{ borderBottom: '2px solid #D9D9D9' }}>
              <IoMdPersonAdd size={32} />
              <p style={{ fontSize: '26px', fontWeight: 700 }}>Cadastro</p>
            </MenuItem> */}
          </div>
        </div>
      </>
    );
  }
}

export default withRouter(AdminModule);
