import styled from 'styled-components';

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  @media (max-width: 768px) {
    flex-direction: column;
    /* width: calc(100vw - 40px)!important; */
    align-items: center !important;
  }  
`;

export const Line = styled.div`
  display: flex;
  flex-direction: row;
  align-items: ${(props) => (props.loading === 1 ? 'inherit' : 'flex-start')};
  @media (max-width: 768px) {
    flex-direction: column;
    width: 100%!important;
    align-items: center !important;
  }
`;

export const Graph = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 300px;
  box-shadow: -1px 1px 5px 1px rgba(0, 0, 0, 0.1);
  padding: 10px;
  border-radius: 4px;
  margin: 5px;
  @media (max-width: 768px) {
    min-width: auto;
  }
  h6 {
    font-size: 1.2rem;
    font-weight: 900;
    color: #858585;
    /* text-align: center; */
    margin-bottom: 28px;
  }
`;

export const GraphTitle = styled.h6`
  text-align: center;
  text-transform: capitalize;
`;
export const GraphTitleGrade = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin-left: 5px;
  margin-right: 5px;
  font-size: 0.9rem;
  font-weight: 600;
  background-color: rgb(189, 32, 123);
  color: white;
  padding: 8px;
  border-top-left-radius: 4px;
  border-top-right-radius: 4px;
  font-weight: 700;
  align-items: center;
  font-size: 1.1rem;
  padding-top: 0px;
  padding-bottom: 0px;
`;
export const GraphGradeTitleItems = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  margin-left: 5px;
  margin-right: 5px;
  font-size: 0.9rem;
  font-weight: 600;
  padding: 8px;
  font-weight: 600;
  padding-top: 0px;
  padding-bottom: 0px;
  line-height: 15px;
  background-color: #bf1f7c;
  color: white;
  padding-top: 3px;
  padding-bottom: 2px;
  text-align: center;
`;
export const GraphGradeItems = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  margin-left: 5px;
  margin-right: 5px;
  font-size: 0.9rem;
  padding: 8px;
  font-size: 0.9rem;
  font-weight: 700;
`;

export const GraphTotalGrade = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  margin-left: 5px;
  margin-right: 5px;
  font-size: 0.9rem;
  font-weight: 600;
  background-color: rgb(189, 32, 123);
  color: white;
  padding: 8px;
  border-bottom-left-radius: 4px;
  border-bottom-right-radius: 4px;
  font-weight: 700;
  align-items: center;
  font-size: 1.1rem;
  padding-top: 0px;
  padding-bottom: 0px;
`;

export const Product = styled.div`
  h6 {
    font-weight: 700;
    font-size: 0.9rem;
    font-weight: 700;
    color: #858585;
  }
  flex-direction: row;
  align-items: stretch;
  justify-content: stretch;
  padding: 0px 10px 0px 10px;
  border-right: 1px solid #ccc;
  flex-wrap: wrap;
  margin-bottom: 20px;
  font-size: 0.9rem;
  color: #858585;
`;

export const Indicator = styled.div`
  display: flex;
  justify-content: space-between;
  cursor: pointer;
  h6 {
    font-weight: 700;
    font-size: 0.9rem;
    font-weight: 700;
    color: #858585;
  }
  p {
    font-size: 0.9rem;
    font-weight: 700;
    color: #000;
  }
  background-color: ${(props) =>
    props.selected === true ? '#8e44ad17' : 'unset'};
`;

export const IndicatorsLine = styled.div`
  border-left: 1px solid #ccc;
  padding: 10px;
  flex-wrap: wrap;
  display: flex;
  flex-direction: ${(props) => (props.loading === 1 ? 'column' : 'row')};
  margin-top: 5px;
  margin-bottom: 10px;
  max-height: 400px;
  width: 100%;
  overflow-y: auto;
  @media (max-width: 768px) {
    display: ${(props) => (props.loading === 1 ? 'none' : 'flex')};
    padding: 0px;
    table{
      max-width: calc(100vw - 45px)!important;
    }
  }
  justify-content: flex-start;
  #indicator:hover {
    background-color: unset!important;
    color: unset!important;
    cursor: pointer!important;
    font-weight: 900!important;
  }
  #product {
    /* color: rgb(130, 130, 130)!important; */
    /* width: 40%; */
}
  #indicator{
    padding-right: 5px!important;
    /* width: 10%; */
  }
  tr:hover{
    color: #bd207b;
  }
  td{
    padding-right: 5px!important;    
  }
`;


export const DivDetalhe = styled.div`
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
`;


export const Linha = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
`;

export const Labels = styled.label`
  font-size: ${(props) =>
    props.fontSize === undefined ? '1rem' : props.fontSize};
  color: ${(props) => (props.color === undefined ? '#858585' : props.color)};
  font-weight: ${(props) =>
    props.fontWeight === undefined ? '700' : props.fontWeight};
`;
