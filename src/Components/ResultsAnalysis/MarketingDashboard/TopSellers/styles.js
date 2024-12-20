import styled from 'styled-components';

export const TopSellersContainer = styled.div`
  margin-top: 30px;
  margin-bottom: 10px;
  .TopSellersContainer {
    display: flex;
    align-items: start;
    padding-left: 5px;
    flex-direction: column;
    margin-top: 38px;
    width: 100%;
    margin-bottom: 5px;
  }

  .TopSellersTitle {
    display: flex;
    justify-content: flex-start;
    margin-bottom: 10px;
    h6 {
      font-size: 1.5rem;
      font-weight: 700;
      color: #858585;
      text-align: center;
    }
  }

  .TopSellersTableLine:hover {
    border: 2px solid #8e44ad;
  }

  .tipo{
    color: #858585;
    font-weight: 600;
  }

  .vencedor {
    text-transform: capitalize;
    font-weight: 600;
    color: #858585;
  }

  .valor {
    text-align: right;
    font-weight: 900;
  }
`;
