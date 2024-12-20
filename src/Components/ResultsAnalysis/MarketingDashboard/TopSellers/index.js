import React, { Component } from 'react';
import newIcon from '../../../assets/images/indicators.png';
import disappointedSalesMan from '../../../assets/images/disappointedsalesman.gif';
import { TopSellersContainer } from './styles';
import { formatFloatBr } from '../../../services/funcoes';
import Skeleton from 'react-loading-skeleton';

class TopSellers extends Component {
  state = {};
  componentDidMount = () => {
    const topSellers = this.props.topSellers;
    this.setState({ topSellers });
  };
  render() {
    // const { topSellers } = this.state;
    return (
      <TopSellersContainer className="TopSellersContainer">
        {this.props.loading === 1 ? (
          <>
            <Skeleton count={1} height={30} />
            <br />
            <br />
            <Skeleton count={5} />
          </>
        ) : (
          <>
            <div className="TopSellersTitle">
              <h6>{this.props.topSellers.title}</h6>
            </div>
            <table style={{lineHeight: '0px', border: '1px solid #ccc', cursor: 'pointer'}}>
              {this.props.topSellers !== undefined &&
                this.props.topSellers.length > 0 &&
                this.props.topSellers.map((topSeller) => (
                  <tr
                    className="TopSellersTableLine"
                    key={topSeller.ORDEM}
                    style={{
                      backgroundColor:
                        topSeller.ORDEM !== undefined && topSeller.ORDEM % 2
                          ? '#dfb2fb'
                          : '#fff',
                    }}
                  >
                    <td className="TopSellersTableColumn">
                      <p className="tipo">{topSeller.TIPO}</p>
                    </td>
                    <td className="TopSellersTableColumn">
                      <p className="vencedor">
                        {topSeller.DESCRICAO !== undefined &&
                          topSeller.DESCRICAO.toLowerCase()}
                      </p>
                    </td>
                    <td className="TopSellersTableColumn">
                      <p className="valor">
                        {topSeller.VALOR !== undefined &&
                          formatFloatBr(topSeller.VALOR)}
                      </p>
                    </td>
                  </tr>
                ))}
            </table>
            {this.props.topSellers !== undefined &&
              this.props.topSellers.length === 0 && (
                <div
                  className="TopSellersTitle"
                  style={{ flexDirection: 'column', width: '300px' }}
                >
                  <img
                    src={disappointedSalesMan}
                    alt={this.props.title}
                    width={300}
                  />
                  <h6>Ops.. não vendeu ainda?</h6>
                </div>
              )}
          </>
        )}
      </TopSellersContainer>
    );
  }
}

export default TopSellers;
