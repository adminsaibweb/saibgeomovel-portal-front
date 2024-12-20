import styled from 'styled-components';

export const Container = styled.div`
  display: flex;
  flex-direction: column;
`;

export const Line = styled.div`
  display: flex;
  flex-direction: row;
  align-items: ${(props) => (props.loading === 1 ? 'inherit' : 'center')};
  @media (max-width: 768px) {
    flex-direction: column;
    width: calc(100vw - 20px) !important;
    align-items: center !important;
  }
`;

export const Graph = styled.div`
  display: flex;
  flex-direction: column;
  h6 {
    font-size: 1.5rem;
    font-weight: 700;
    color: #858585;
    text-align: center;
    margin-bottom: 28px;
  }
  /* box-shadow: rgba(0,0,0,0.1) 0px 0px 2px 2px; */
  margin-right: 5px;
  padding-bottom: 10px;
  canvas{
    height: 170px!important;
    width: 360px!important;
  }
`;

export const Indicator = styled.div`
  display: flex;
  flex-direction: row;
  align-items: stretch;
  justify-content: stretch;
  padding: 0px 10px 0px 10px;
  /* border-right: 1px solid #ccc; */
  flex-wrap: wrap;
  min-width: 150px;
  /* max-width: 150px; */
  min-height: 100px;
  margin-bottom: 10px;
  font-size: 0.9rem;
  color: #6c6c6c;
  cursor: pointer;
  border-radius: 1rem;
  margin-right: 5px;
  padding-bottom: 5px;
  font-weight: 600;
  h6 {
    font-weight: 700;
    font-size: 0.9rem;
    font-weight: 800;
    color: #8e44ad;
  }
  h5 {
    font-weight: 700;
    font-size: 1.5rem;
  }
  p {
    font-size: 0.9rem;
    font-weight: 700;
    color: #000;
  }
  tr:hover {
    background-color: unset !important;
    color: unset !important;
    cursor: unset !important;
  }
  :hover {
    background: linear-gradient(to right, #e6e3e44d, #9b9b9b4d);
  }
  background: ${(props) =>
    props.selected === true
      ? 'linear-gradient(to right,#e6e3e44d,#9b9b9b4d);'
      : 'linear-gradient(to right,#e6e3e41a,#9b9b9b1a)'};
`;

export const IndicatorsLine = styled.div`
  border-left: 1px solid #ccc;
  padding: 10px;
  flex-wrap: wrap;
  display: flex;
  flex-direction: ${(props) => (props.loading === 1 ? 'column' : 'row')};
  margin-top: 5px;
  @media (max-width: 768px) {
    display: ${(props) => (props.loading === 1 ? 'none' : 'flex')};
  }
  justify-content: flex-start;
`;
