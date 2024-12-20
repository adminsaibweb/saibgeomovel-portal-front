import styled  from 'styled-components';

export const Linha = styled.div`
  display: flex;
  flex-direction: row;
  align-items: baseline;
  flex-wrap: nowrap;
  width: 100%;
  justify-content: flex-start;
  padding: 10px;
  margin-top: 10px;
  @media (max-width: 768px) {
    padding-top: 0px;
    flex-direction: column;
  }
  div {
    padding-right: 2px;
  }
`;

export const DivDetalhe = styled.div`
  display: flex;
  flex-direction: column;
  @media (max-width: 768px) {
    padding-top: 0px;
  }

`;