import styled from 'styled-components';

export const Container = styled.div`
  border: 1px solid #e9e9e9;
  box-shadow: 0px 0px 4px 2px #ccc;
  border-radius: 5px;
  /* background-color: #f7f7f7; */
  max-width: 300px;
  min-width: 200px;
  min-height: 200px;
  height: 300px;
  margin: 10px;
  margin-left: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;

  padding-top: 5px;

  @media (max-width: 340px) {
    max-width: 250px;
  }
  @media (max-width: 768px) {
    margin-left: 0 !important;
    max-width: unset;
    margin: 10px 0;
  }
`;

export const ContentLabels = styled.div`
  p {
    margin: 0 10px;
    line-height: 1rem;
  }
  p.pClient {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-right: 0;
    height: 1.2rem;
  }
`;

export const Title = styled.p`
  font-weight: ${(props) => props.bold && 'bold'};
  color: ${(props) => (props.color ? props.color : '#555555')};
  text-transform: capitalize;
  font-size: ${(props) => (props.contrast ? '1.1rem' : '1rem')};

  ${(props) =>
    props.withLimiterLabel &&
    `
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      margin-bottom: 5px !important;
`}
`;
export const DivDetalhe = styled.div`
  display: flex;
  flex-direction: column;
  padding-top: 5px;
  .graphic {
    min-width: 45%;
  }
  @media (max-width: 768px) {
    padding-top: 0px;
  }

  p {
    padding: 0 4px;
    font-weight: 500;
    color: #858585;
  }
  span {
    padding: 0 4px;
    color: #858585;
  }
`;

export const ContentIncoformity = styled.div`
  display: flex;
  flex-direction: column;
  margin: 10px 10px 0 10px;
  p {
    line-height: 1.2rem;
    span {
      font-weight: 500;
    }
  }
`;

export const FooterCard = styled.div`
  display: flex;
  justify-content: space-between;
  /* background: #fff; */

  button {
    width: 100% !important;
    margin: 5px !important;

    display: flex !important;
    align-items: center !important;
    justify-content: space-evenly !important;
  }
`;
