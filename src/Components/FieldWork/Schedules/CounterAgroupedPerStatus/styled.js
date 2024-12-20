import styled from 'styled-components';

export const Container = styled.div`
  padding: 0 5px;
  width: ${(props) => (props.flexDirection === 'row' ? '100%' : '100%')};
  ul {
    display: ${(props) => props.flexDirection === 'row' && 'flex'};
    justify-content: ${(props) => (props.flexDirection === 'row' ? 'space-between' : 'none')};
    li {
      display: flex;
      justify-content: space-between;

      font-weight: 500;
      color: ${(props) => (props.clicked && props.clicked ? '#000' : '#858585')};

      font-size: 0.9rem;

      @media (max-width: 1367px) {
        /* font-size: 0.8rem; */
      }

      white-space: nowrap;
      overflow: hidden;

      p.label {
        padding-right: 5px;
      }
    }
  }
`;

export const P = styled.p`
  color: ${(props) => props.color};
`;
