import React, { Component } from 'react';
import { Titulo, Linha, DivDetalhe, Labels } from '../style';
import { Icon, Collapsible, CollapsibleItem } from 'react-materialize';
import truckExclamation from '../../../../assets/images/truck-exclamation.png';
import truckChecked from '../../../../assets/images/truck-checked.png';
import { alerta } from '../../../../services/funcoes';
import SaibRadioGroup from '../../../../Components/Globals/SaibRadioGroup';
import LogisticsMaisDetalhes from '../MaisDetalhes';
import './forced.css';
import M from 'materialize-css';

export default class FecharRota extends Component {
  state = {
    data: undefined,
  };

  componentDidMount = () => {
    //console.log('FecharRota');
    //console.log('this.props.data');
    //console.log(this.props.data);
    this.setState({ data: this.props.data });
  };

  render() {
    const { data } = this.state;
    return (
      <>
        <Titulo
          style={{
            justifyContent: 'flex-start',
            paddingLeft: '15px',
          }}
        >
          <Icon className="modal-close" style={{ cursor: 'pointer' }}>
            arrow_back
          </Icon>
          <p
            style={{
              position: 'unset',
              top: 'unset',
              width: '100%',
            }}
          >
            {' '}
            Fechamento de rota
          </p>
        </Titulo>
        <Collapsible
          accordion={false}
          className="acertoRotaPedidosEntregues"
          style={{
            width: '100%',
            borderStyle: 'none',
            boxShadow: 'none',
          }}
        >
          <CollapsibleItem
            expanded={false}
            header={<Labels>Pedidos Entregue</Labels>}
            icon={
              <>
                <li className="material-icons plus">add_circle_outline</li>
                <li className="material-icons minus">remove_circle_outline</li>
              </>
            }
            node="div"
          >
            {data !== undefined &&
              data.map((pedido) => (
                <>
                  {/* {pedido.statusEntrega === 3 && (
                    <LogisticsMaisDetalhes
                      data={pedido}
                      //   onUpdateSale={this.onUpdateSale}
                    />
                  )} */}
                </>
              ))}
          </CollapsibleItem>
        </Collapsible>
      </>
    );
  }
}
