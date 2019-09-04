import React, { Component } from 'react';
import { FaGitAlt, FaPlus, FaSpinner } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import Container from '../../Components/Container';
import { Form, SubmitButton, List } from './styles';

import api from '../../services';

export default class Main extends Component {
	state = {
		newRepo: '',
		repositories: [],
		loading: false,
		error: false,
	};

	componentDidMount() {
		const repositories = localStorage.getItem('repositories');
		if (repositories) {
			this.setState({ repositories: JSON.parse(repositories) });
		}
	}

	// Salva os dados no localstorage
	componentDidUpdate(_, prevState) {
		const { repositories } = this.state;
		if (prevState.repositories !== repositories) {
			localStorage.setItem('repositories', JSON.stringify(repositories));
		}
	}

	handleInputChange = e => {
		this.setState({ newRepo: e.target.value });
	};

	handleSubmit = async e => {
		try {
			e.preventDefault();

			this.setState({ loading: true });

			const { newRepo, repositories } = this.state;

			if (repositories.find(repo => repo.name === newRepo)) {
				throw new Error('Repositório Duplicado');
			}

			const response = await api.get(`/repos/${newRepo}`);

			const data = {
				name: response.data.full_name,
			};

			this.setState({
				repositories: [...repositories, data],
				newRepo: '',
				loading: false,
				error: false,
			});
		} catch (err) {
			this.setState({ error: true, loading: false });
			console.error(err);
		}
	};

	render() {
		const { newRepo, repositories, error, loading } = this.state;
		return (
			<Container>
				<h1>
					<FaGitAlt />
					Repositories
				</h1>

				<Form onSubmit={this.handleSubmit}>
					<input
						type="text"
						placeholder="Adicionar respositório"
						value={newRepo}
						onChange={this.handleInputChange}
						className={error ? 'error' : ''}
					/>

					<SubmitButton loading={loading ? 1 : 0}>
						{loading ? (
							<FaSpinner color="#fff" size={14} />
						) : (
							<FaPlus color="#fff" size={14} />
						)}
					</SubmitButton>
				</Form>

				<List>
					{repositories.map(repository => (
						<li key={repository.name}>
							<span>{repository.name}</span>
							<Link
								to={`/repository/${encodeURIComponent(
									repository.name
								)}`}
							>
								Detalhes
							</Link>
						</li>
					))}
				</List>
			</Container>
		);
	}
}
