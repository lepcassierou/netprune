import React from 'react';
import { useParams } from "react-router-dom"

import Instance from '/imports/ui/components/Instance/Instance';


const withRouter = Instance => props => {
    const params = useParams();

    return (
        <Instance
            {...props}
            id={params.id}
        />
    );
};

export default withRouter(Instance);