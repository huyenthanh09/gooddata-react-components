// (C) 2020 GoodData Corporation
module.exports = projectId => {
    return {
        executionResponse: {
            dimensions: [
                {
                    headers: [
                        {
                            measureGroupHeader: {
                                items: [
                                    {
                                        measureHeaderItem: {
                                            name: "Amount",
                                            format: "#,##0.00",
                                            localIdentifier: "amountMetric",
                                            uri: "/gdc/md/" + projectId + "/obj/1279",
                                            identifier: "ah1EuQxwaCqs",
                                        },
                                    },
                                ],
                            },
                        },
                    ],
                },
                {
                    headers: [
                        {
                            attributeHeader: {
                                name: "Department",
                                localIdentifier: "departmentAttribute",
                                uri: "/gdc/md/" + projectId + "/obj/1027",
                                identifier: "label.owner.department",
                                formOf: {
                                    uri: "/gdc/md/" + projectId + "/obj/1026",
                                    identifier: "department",
                                    name: "Department",
                                },
                            },
                        },
                    ],
                },
            ],
            links: {
                executionResult:
                    "/gdc/app/projects/d20eyb3wfs0xe5l0lfscdnrnyhq1t42q/executionResults/434288883375800256?q=eAGdkE9vwjAMxb9KFa4VDd0GGtI0Ie2PuOwwDe2Aekgbt2RKmpK4YhXqd59DEWw79mYnzz8%2FvyNz%0A0FiHb8IAW7JNjQo1SBazwurW1J9K4s6z5TaLWak0gjs3zh5CxQygU8Wrs23DSOOJxZbH8%2FRfbdYT%0AwzojSMEqp65bgu7IBBIqbxE%2BggfSPEEjHBqokfz41hjhOnqmRirfaNG9EG0t6SmpZJEYmciUQ5ff%0AHErPv%2BFOc136Qtau7nb7Gd6m%2B8TmX8mMpwti5MLDs4aA37yvR0DmCQzj%2FlHJByKesvvv%2B3LVKKPz%0AgLUodIhom2U9ZTxEPmR2yXMSTyZ8yjnpr0mtIqojW0ZC60gCUeLIQSWc1OB9%2BPAoKoisCwW2fvrr%0AipWx7Sn5Yd8I%2B%2BninvVZ%2FwOra82e%0A&c=ffe69ccaffc9cfd7c4e322941ba4cab8&dimension=Department&dimension=Amount",
            },
        },
    };
};
