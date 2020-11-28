import React from "react"
import styled from "styled-components"
import { Link } from "gatsby"

const TagListWrapper = styled.div`
  margin-bottom: 1rem;
  word-break: break-all;

  & a {
    display: inline-block;
    padding: 0.6rem 0.7rem;
    margin-right: 0.5rem;
    margin-bottom: 0.5rem;
    border-radius: 50px;
    background-color: #f1f3f5;
    text-decoration: none;
    font-size: 0.9rem;
    color: #495057;
    transition: all 0.2s;
  }

  & a:hover {
    background-color: #dee2e6;
  }
`

const TagList = ({ tagList }) => {
  return (
    <TagListWrapper>
      {tagList.map((tag, i) => (
        <Link to={`/tags/${tag}`}>#{tag}</Link>
      ))}
    </TagListWrapper>
  )
}

export default TagList